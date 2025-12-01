import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  verifyWebhookSignature,
  mapResendEventType,
  type ResendWebhookPayload,
} from '@/lib/email/webhook-signature';

// Supabase client avec service role (bypass RLS)
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
 * Webhook Resend - Reçoit les événements email en temps réel
 *
 * POST /api/webhooks/resend
 *
 * Événements supportés :
 * - email.sent : Email envoyé depuis Resend
 * - email.delivered : Email délivré au serveur destinataire
 * - email.opened : Email ouvert par le destinataire
 * - email.clicked : Lien cliqué dans l'email
 * - email.bounced : Email rejeté (hard/soft bounce)
 * - email.complained : Marqué comme spam
 *
 * Sécurité : Vérifie la signature HMAC (svix-signature header)
 *
 * Configuration requise :
 * - Resend Dashboard > Webhooks > Add webhook
 * - URL : https://welcomeapp.be/api/webhooks/resend
 * - Events : Sélectionner tous les événements
 * - Copier le signing secret dans RESEND_WEBHOOK_SECRET
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Lire le body brut (nécessaire pour vérifier la signature)
    const body = await request.text();
    const signature = request.headers.get('svix-signature');
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    // 2. Vérifier que le secret est configuré
    if (!webhookSecret) {
      console.error('[Resend Webhook] RESEND_WEBHOOK_SECRET non configuré');
      return NextResponse.json(
        {
          error: 'Configuration manquante',
          message: 'RESEND_WEBHOOK_SECRET non configuré dans les variables d\'environnement',
        },
        { status: 500 }
      );
    }

    // 3. Vérifier la signature HMAC
    const isValid = verifyWebhookSignature(body, signature, webhookSecret);

    if (!isValid) {
      console.error('[Resend Webhook] Signature invalide');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Signature webhook invalide' },
        { status: 401 }
      );
    }

    // 4. Parser le payload
    const payload: ResendWebhookPayload = JSON.parse(body);
    const { type, data } = payload;

    console.log(`[Resend Webhook] Événement reçu: ${type} pour ${data.email_id}`);

    // 5. Extraire les données de l'événement
    const emailId = data.email_id;
    const recipientEmail = Array.isArray(data.to) ? data.to[0] : data.to;
    const eventType = mapResendEventType(type);

    // 6. Préparer les event_data selon le type d'événement
    const eventData: Record<string, unknown> = {
      from: data.from,
      subject: data.subject,
      resend_created_at: data.created_at,
    };

    // Ajouter des données spécifiques selon le type
    if (type === 'email.clicked' && data.click) {
      eventData.link = data.click.link;
      eventData.click_timestamp = data.click.timestamp;
      eventData.ip_address = data.click.ip_address;
      eventData.user_agent = data.click.user_agent;
    }

    if (type === 'email.bounced' && data.bounce) {
      eventData.bounce_type = data.bounce.bounce_type;
      eventData.bounce_reason = data.bounce.reason;
    }

    if (type === 'email.complained' && data.complaint) {
      eventData.feedback_type = data.complaint.feedback_type;
      eventData.user_agent = data.complaint.user_agent;
    }

    // 7. Identifier la source de l'email (campagne marketing ou automation transactionnelle)
    const supabase = getSupabase();

    let campaignId: string | null = null;
    let automationHistoryId: string | null = null;
    let emailSource: 'campaign' | 'automation' = 'campaign';

    // 7a. D'abord chercher dans email_events existant (si événement déjà reçu)
    const { data: existingEvent, error: lookupError } = await supabase
      .from('email_events')
      .select('campaign_id, automation_history_id, email_source')
      .eq('email_id', emailId)
      .maybeSingle();

    if (lookupError && lookupError.code !== 'PGRST116') {
      console.error('[Resend Webhook] Erreur lookup existingEvent:', lookupError);
    }

    if (existingEvent) {
      // Événement déjà enregistré, réutiliser les IDs
      campaignId = existingEvent.campaign_id;
      automationHistoryId = existingEvent.automation_history_id;
      emailSource = existingEvent.email_source || 'campaign';
    } else {
      // 7b. Nouvel email, chercher dans automation_history par resend_id
      const { data: automationData, error: automationError } = await supabase
        .rpc('get_automation_history_by_resend_id', { p_resend_id: emailId });

      if (automationError) {
        console.error('[Resend Webhook] Erreur lookup automation_history:', automationError);
      }

      if (automationData && automationData.length > 0) {
        // C'est un email automatique (welcome, relance, etc.)
        automationHistoryId = automationData[0].id;
        emailSource = 'automation';
        console.log(`[Resend Webhook] Email automatique détecté: ${automationData[0].email_type}`);
      }
      // Sinon c'est peut-être un email de campagne dont on n'a pas encore l'événement 'sent'
      // ou un email transactionnel sans resend_id enregistré (ex: reset password)
    }

    // 8. Insérer l'événement dans email_events
    const { error: insertError } = await supabase.from('email_events').insert({
      campaign_id: campaignId,
      automation_history_id: automationHistoryId,
      email_source: emailSource,
      email_id: emailId,
      recipient_email: recipientEmail,
      event_type: eventType,
      event_data: eventData,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('[Resend Webhook] Erreur insert email_events:', insertError);

      // Si c'est une erreur de clé étrangère, on log mais on retourne OK
      if (insertError.code === '23503') {
        console.warn(
          `[Resend Webhook] Foreign key invalide, événement ignoré - campaign_id: ${campaignId}, automation_history_id: ${automationHistoryId}`
        );
        return NextResponse.json({ received: true, warning: 'foreign key invalide' });
      }

      return NextResponse.json(
        { error: 'Database error', message: insertError.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;

    console.log(
      `[Resend Webhook] Événement ${type} enregistré (${duration}ms) - source: ${emailSource}, campaign_id: ${campaignId || 'N/A'}, automation_id: ${automationHistoryId || 'N/A'}`
    );

    // 9. Retourner 200 OK pour confirmer la réception à Resend
    return NextResponse.json({
      received: true,
      event_type: eventType,
      email_id: emailId,
      email_source: emailSource,
      campaign_id: campaignId,
      automation_history_id: automationHistoryId,
      duration_ms: duration,
    });
  } catch (error) {
    console.error('[Resend Webhook] Erreur inattendue:', error);
    return NextResponse.json(
      {
        error: 'Internal error',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler pour tester que le webhook est accessible
 * (Resend peut envoyer un GET pour vérifier l'URL)
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Resend webhook endpoint actif',
    supported_events: [
      'email.sent',
      'email.delivered',
      'email.opened',
      'email.clicked',
      'email.bounced',
      'email.complained',
    ],
  });
}
