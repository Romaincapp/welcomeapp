import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import { createClient } from '@supabase/supabase-js';
import {
  WelcomeEmail,
  InactiveReactivation,
  TipsReminder,
} from '@/emails';

// Initialiser Resend (lazy loaded)
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Supabase client avec service role (bypass RLS) - lazy loaded
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Cron Job : Email Automations
 *
 * GET /api/cron/email-automations
 *
 * Sécurité : Protégé par CRON_SECRET (défini dans Vercel)
 * Fréquence : Toutes les heures (configuré dans vercel.json)
 *
 * Exécute 3 types d'automatisations :
 * 1. welcome_sequence : Séquence de bienvenue (J+0, J+3, J+7)
 * 2. inactive_reactivation : Relance inactifs (>30 jours)
 * 3. tips_reminder : Rappel ajouter tips (<10 tips)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Vérifier l'authentification Cron Secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[CRON] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[CRON] Unauthorized: Invalid cron secret');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] ✅ Authorized - Starting email automations cron job');

    // Initialiser les clients (lazy loading)
    const supabase = getSupabase();
    const resend = getResend();

    // 2. Récupérer toutes les automatisations activées
    const { data: automations, error: automationsError } = await supabase
      .from('email_automations')
      .select('*')
      .eq('is_enabled', true);

    if (automationsError) {
      console.error('[CRON] Error fetching automations:', automationsError);
      return NextResponse.json(
        { error: 'Failed to fetch automations' },
        { status: 500 }
      );
    }

    if (!automations || automations.length === 0) {
      console.log('[CRON] No active automations found');
      return NextResponse.json({
        success: true,
        message: 'No active automations',
        emailsSent: 0,
      });
    }

    console.log(`[CRON] Found ${automations.length} active automation(s)`);

    // 3. Exécuter chaque automation
    let totalSent = 0;
    let totalFailed = 0;
    const results: any[] = [];

    for (const automation of automations) {
      console.log(`[CRON] Processing automation: ${automation.automation_type}`);

      let sent = 0;
      let failed = 0;

      switch (automation.automation_type) {
        case 'welcome_sequence':
          const welcomeResult = await processWelcomeSequence(automation.config, supabase, resend);
          sent += welcomeResult.sent;
          failed += welcomeResult.failed;
          results.push({ type: 'welcome_sequence', ...welcomeResult });
          break;

        case 'inactive_reactivation':
          const inactiveResult = await processInactiveReactivation(automation.config, supabase, resend);
          sent += inactiveResult.sent;
          failed += inactiveResult.failed;
          results.push({ type: 'inactive_reactivation', ...inactiveResult });
          break;

        case 'tips_reminder':
          const tipsResult = await processTipsReminder(automation.config, supabase, resend);
          sent += tipsResult.sent;
          failed += tipsResult.failed;
          results.push({ type: 'tips_reminder', ...tipsResult });
          break;

        default:
          console.warn(`[CRON] Unknown automation type: ${automation.automation_type}`);
      }

      totalSent += sent;
      totalFailed += failed;
    }

    const duration = Date.now() - startTime;
    console.log(
      `[CRON] ✅ Cron job completed in ${duration}ms - Sent: ${totalSent}, Failed: ${totalFailed}`
    );

    return NextResponse.json({
      success: true,
      totalSent,
      totalFailed,
      duration,
      results,
    });
  } catch (error) {
    console.error('[CRON] Fatal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Traiter la séquence de bienvenue (J+0, J+3, J+7)
 */
async function processWelcomeSequence(config: any, supabase: any, resend: any) {
  console.log('[CRON] Processing welcome sequence...');

  const days = config.days || [0, 3, 7];
  const templates = config.templates || ['welcome', 'tips_reminder', 'tips_reminder'];
  const subjects = config.subjects || [
    'Bienvenue sur WelcomeApp ! 👋',
    'Comment se passe votre première semaine ?',
    'Découvrez toutes les fonctionnalités de WelcomeApp',
  ];

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const templateType = templates[i];
    const subject = subjects[i];
    const emailType = `welcome_day_${day}`;

    // Trouver les gestionnaires éligibles pour ce jour
    const { data: eligibleClients, error } = await supabase
      .from('clients')
      .select('id, email, name, slug, created_at')
      .not('email', 'is', null)
      .gte('created_at', new Date(Date.now() - (day + 1) * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', new Date(Date.now() - day * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error(`[CRON] Error fetching eligible clients for day ${day}:`, error);
      continue;
    }

    if (!eligibleClients || eligibleClients.length === 0) {
      console.log(`[CRON] No eligible clients for welcome day ${day}`);
      continue;
    }

    console.log(`[CRON] Found ${eligibleClients.length} eligible client(s) for welcome day ${day}`);

    // Filtrer ceux qui n'ont pas encore reçu cet email
    for (const client of eligibleClients) {
      const { data: alreadySent } = await supabase
        .from('automation_history')
        .select('id')
        .eq('client_id', client.id)
        .eq('email_type', emailType)
        .single();

      if (alreadySent) {
        console.log(`[CRON] Email ${emailType} already sent to ${client.email}`);
        continue;
      }

      // Envoyer l'email
      try {
        const htmlContent = await renderWelcomeEmail(templateType, client, day, supabase);

        const result = await resend.emails.send({
          from: 'WelcomeApp <noreply@welcomeapp.be>',
          to: client.email,
          subject: subject,
          html: htmlContent,
        });

        // Logger dans automation_history
        await supabase.from('automation_history').insert({
          client_id: client.id,
          automation_type: 'welcome_sequence',
          email_type: emailType,
          success: true,
          resend_id: result.data?.id,
          metadata: {
            day,
            template: templateType,
            subject,
          },
        });

        console.log(`[CRON] ✅ Sent ${emailType} to ${client.email}`);
        sent++;
      } catch (error) {
        console.error(`[CRON] ❌ Failed to send ${emailType} to ${client.email}:`, error);

        // Logger l'échec
        await supabase.from('automation_history').insert({
          client_id: client.id,
          automation_type: 'welcome_sequence',
          email_type: emailType,
          success: false,
          error_message: error instanceof Error ? error.message : String(error),
          metadata: { day, template: templateType },
        });

        failed++;
      }
    }
  }

  return { sent, failed };
}

/**
 * Traiter la relance des inactifs (>30 jours sans login)
 */
async function processInactiveReactivation(config: any, supabase: any, resend: any) {
  console.log('[CRON] Processing inactive reactivation...');

  const daysInactive = config.days_inactive || 30;
  const cooldownDays = config.cooldown_days || 60;
  const subject = config.subject || 'Ça fait un moment ! Découvrez les nouveautés';

  let sent = 0;
  let failed = 0;

  // Trouver les gestionnaires inactifs (pas de connexion depuis X jours)
  const { data: inactiveClients, error } = await supabase
    .from('clients')
    .select('id, email, name, slug, created_at')
    .not('email', 'is', null)
    .lte('created_at', new Date(Date.now() - daysInactive * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('[CRON] Error fetching inactive clients:', error);
    return { sent: 0, failed: 0 };
  }

  if (!inactiveClients || inactiveClients.length === 0) {
    console.log('[CRON] No inactive clients found');
    return { sent: 0, failed: 0 };
  }

  console.log(`[CRON] Found ${inactiveClients.length} inactive client(s)`);

  for (const client of inactiveClients) {
    // Vérifier si on a déjà envoyé récemment (cooldown)
    const { data: lastSent } = await supabase
      .from('automation_history')
      .select('sent_at')
      .eq('client_id', client.id)
      .eq('automation_type', 'inactive_reactivation')
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();

    if (lastSent) {
      const daysSinceLastSent = Math.floor(
        (Date.now() - new Date(lastSent.sent_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastSent < cooldownDays) {
        console.log(`[CRON] Cooldown active for ${client.email} (${daysSinceLastSent} days)`);
        continue;
      }
    }

    // Envoyer l'email de réactivation
    try {
      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      const htmlContent = await render(
        InactiveReactivation({
          managerName: client.name || client.email.split('@')[0],
          managerEmail: client.email,
          slug: client.slug || 'demo',
          daysSinceLastLogin: daysSinceCreation,
          totalTips: 0,
          totalViews: 0,
        })
      );

      const result = await resend.emails.send({
        from: 'WelcomeApp <noreply@welcomeapp.be>',
        to: client.email,
        subject: subject,
        html: htmlContent,
      });

      // Logger dans automation_history
      await supabase.from('automation_history').insert({
        client_id: client.id,
        automation_type: 'inactive_reactivation',
        email_type: `inactive_reactivation_${daysInactive}d`,
        success: true,
        resend_id: result.data?.id,
        metadata: {
          days_inactive: daysInactive,
          days_since_creation: daysSinceCreation,
        },
      });

      console.log(`[CRON] ✅ Sent inactive reactivation to ${client.email}`);
      sent++;
    } catch (error) {
      console.error(`[CRON] ❌ Failed to send inactive reactivation to ${client.email}:`, error);

      // Logger l'échec
      await supabase.from('automation_history').insert({
        client_id: client.id,
        automation_type: 'inactive_reactivation',
        email_type: `inactive_reactivation_${daysInactive}d`,
        success: false,
        error_message: error instanceof Error ? error.message : String(error),
      });

      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Traiter le rappel d'ajouter des tips (<10 tips)
 */
async function processTipsReminder(config: any, supabase: any, resend: any) {
  console.log('[CRON] Processing tips reminder...');

  const maxTips = config.max_tips || 10;
  const checkEveryDays = config.check_every_days || 7;
  const subject = config.subject || '💡 Enrichissez votre WelcomeBook avec de nouveaux conseils';

  let sent = 0;
  let failed = 0;

  // Trouver les gestionnaires avec <10 tips
  const { data: clientsNeedingTips, error } = await supabase.rpc('get_clients_with_few_tips', {
    max_tips_count: maxTips,
  });

  if (error) {
    console.error('[CRON] Error fetching clients needing tips:', error);
    // Fallback: requête manuelle
    const { data: fallbackClients } = await supabase
      .from('clients')
      .select('id, email, name, slug, created_at')
      .not('email', 'is', null);

    if (!fallbackClients) return { sent: 0, failed: 0 };

    // Compter les tips pour chaque client
    for (const client of fallbackClients) {
      const { count } = await supabase
        .from('tips')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id);

      if (count === null || count >= maxTips) continue;

      // Vérifier cooldown
      const { data: lastSent } = await supabase
        .from('automation_history')
        .select('sent_at')
        .eq('client_id', client.id)
        .eq('automation_type', 'tips_reminder')
        .order('sent_at', { ascending: false })
        .limit(1)
        .single();

      if (lastSent) {
        const daysSinceLastSent = Math.floor(
          (Date.now() - new Date(lastSent.sent_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastSent < checkEveryDays) continue;
      }

      // Envoyer l'email
      try {
        const daysSinceCreation = Math.floor(
          (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        const htmlContent = await render(
          TipsReminder({
            managerName: client.name || client.email.split('@')[0],
            managerEmail: client.email,
            slug: client.slug || 'demo',
            currentTipsCount: count || 0,
            daysSinceCreation,
            suggestedCategories: ['Restaurants', 'Activités', 'Transports', 'Infos pratiques'],
          })
        );

        const result = await resend.emails.send({
          from: 'WelcomeApp <noreply@welcomeapp.be>',
          to: client.email,
          subject: subject,
          html: htmlContent,
        });

        // Logger dans automation_history
        await supabase.from('automation_history').insert({
          client_id: client.id,
          automation_type: 'tips_reminder',
          email_type: 'tips_reminder',
          success: true,
          resend_id: result.data?.id,
          metadata: {
            current_tips: count,
            max_tips: maxTips,
          },
        });

        console.log(`[CRON] ✅ Sent tips reminder to ${client.email}`);
        sent++;
      } catch (error) {
        console.error(`[CRON] ❌ Failed to send tips reminder to ${client.email}:`, error);

        await supabase.from('automation_history').insert({
          client_id: client.id,
          automation_type: 'tips_reminder',
          email_type: 'tips_reminder',
          success: false,
          error_message: error instanceof Error ? error.message : String(error),
        });

        failed++;
      }
    }

    return { sent, failed };
  }

  // Pas de clients trouvés
  return { sent: 0, failed: 0 };
}

/**
 * Rendre le template d'email pour la séquence de bienvenue
 */
async function renderWelcomeEmail(templateType: string, client: any, day: number, supabase: any): Promise<string> {
  const managerName = client.name || client.email.split('@')[0];
  const managerEmail = client.email;
  const slug = client.slug || 'demo';

  if (templateType === 'welcome') {
    return render(
      WelcomeEmail({
        managerName,
        managerEmail,
        slug,
      })
    );
  } else if (templateType === 'tips_reminder') {
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Compter les tips actuels
    const { count } = await supabase
      .from('tips')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);

    return render(
      TipsReminder({
        managerName,
        managerEmail,
        slug,
        currentTipsCount: count || 0,
        daysSinceCreation,
        suggestedCategories: ['Restaurants', 'Activités', 'Transports', 'Infos pratiques'],
      })
    );
  }

  throw new Error(`Unknown template type: ${templateType}`);
}
