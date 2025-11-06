import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import { requireAdmin } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  WelcomeEmail,
  InactiveReactivation,
  FeatureAnnouncement,
  Newsletter,
  TipsReminder,
} from '@/emails';

// Initialiser Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * API Route : Envoyer une campagne email
 *
 * POST /api/admin/send-campaign
 *
 * Body:
 * {
 *   templateType: 'welcome' | 'inactive_reactivation' | 'feature_announcement' | 'newsletter' | 'tips_reminder',
 *   subject: string,
 *   segment: 'all' | 'Inactif' | 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert',
 *   testMode?: boolean,  // Si true, envoie uniquement à l'admin
 *   abTestEnabled?: boolean,  // Si true, active l'A/B testing sur le sujet
 *   abTestSubjectA?: string,  // Sujet de la variante A (requis si abTestEnabled = true)
 *   abTestSubjectB?: string,  // Sujet de la variante B (requis si abTestEnabled = true)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   totalSent: number,
 *   totalFailed: number,
 *   results: Array<{ email: string, status: 'sent' | 'failed', id?: string, error?: string }>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification admin
    const adminUser = await requireAdmin();

    // 2. Parser le body
    const {
      templateType,
      subject,
      segment,
      testMode,
      abTestEnabled,
      abTestSubjectA,
      abTestSubjectB,
    } = await request.json();

    // 3. Valider les paramètres
    if (!templateType || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: templateType, subject' },
        { status: 400 }
      );
    }

    // Valider l'A/B testing si activé
    if (abTestEnabled && (!abTestSubjectA || !abTestSubjectB)) {
      return NextResponse.json(
        { error: 'A/B testing requires both abTestSubjectA and abTestSubjectB' },
        { status: 400 }
      );
    }

    // 4. Obtenir les destinataires selon le segment
    const supabase = await createServerSupabaseClient();

    let query;
    if (segment === 'all') {
      // Tous les gestionnaires
      query = supabase
        .from('clients')
        .select('id, email, name, slug, created_at')
        .not('email', 'is', null);
    } else {
      // Segmentation par catégorie (utilise la vue manager_categories)
      query = supabase
        .from('manager_categories' as any)
        .select('*')
        .eq('category', segment);
    }

    const { data: recipients, error: recipientsError } = await query;

    if (recipientsError) {
      console.error('[SEND CAMPAIGN] Error fetching recipients:', recipientsError);
      return NextResponse.json(
        { error: 'Failed to fetch recipients' },
        { status: 500 }
      );
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found for this segment' },
        { status: 400 }
      );
    }

    // 5. Mode test : envoyer uniquement à l'admin
    const finalRecipients = testMode
      ? [{ email: adminUser.email, name: 'Admin Test', slug: 'test', id: adminUser.id }]
      : recipients;

    // 6. A/B Testing : splitter les destinataires en 2 groupes (50/50)
    if (abTestEnabled && !testMode) {
      console.log(
        `[SEND CAMPAIGN] A/B Testing enabled - splitting ${finalRecipients.length} recipients into 2 groups`
      );

      // Shuffle recipients pour randomiser
      const shuffled = [...finalRecipients].sort(() => Math.random() - 0.5);
      const halfIndex = Math.floor(shuffled.length / 2);
      const groupA = shuffled.slice(0, halfIndex);
      const groupB = shuffled.slice(halfIndex);

      // Envoyer variante A
      console.log(`[SEND CAMPAIGN] Sending variant A to ${groupA.length} recipients`);
      const resultsA = await sendEmailBatch({
        recipients: groupA,
        templateType,
        subject: abTestSubjectA!,
        supabase,
      });

      const totalSentA = resultsA.filter((r) => r.status === 'sent').length;
      const totalFailedA = resultsA.filter((r) => r.status === 'failed').length;

      // Sauvegarder campagne variante A
      const { data: campaignA, error: saveErrorA } = await supabase
        .from('email_campaigns')
        .insert({
          template_type: templateType,
          subject: abTestSubjectA,
          segment,
          total_sent: totalSentA,
          total_failed: totalFailedA,
          total_recipients: totalSentA + totalFailedA,
          sent_by: adminUser.email,
          results: resultsA,
          ab_test_enabled: true,
          ab_test_variant: 'A',
          ab_test_subject_a: abTestSubjectA,
          ab_test_subject_b: abTestSubjectB,
        })
        .select()
        .single();

      if (saveErrorA) {
        console.error('[SEND CAMPAIGN] Error saving variant A:', saveErrorA);
      }

      // Envoyer variante B
      console.log(`[SEND CAMPAIGN] Sending variant B to ${groupB.length} recipients`);
      const resultsB = await sendEmailBatch({
        recipients: groupB,
        templateType,
        subject: abTestSubjectB!,
        supabase,
      });

      const totalSentB = resultsB.filter((r) => r.status === 'sent').length;
      const totalFailedB = resultsB.filter((r) => r.status === 'failed').length;

      // Sauvegarder campagne variante B
      const { data: campaignB, error: saveErrorB } = await supabase
        .from('email_campaigns')
        .insert({
          template_type: templateType,
          subject: abTestSubjectB,
          segment,
          total_sent: totalSentB,
          total_failed: totalFailedB,
          total_recipients: totalSentB + totalFailedB,
          sent_by: adminUser.email,
          results: resultsB,
          ab_test_enabled: true,
          ab_test_variant: 'B',
          ab_test_subject_a: abTestSubjectA,
          ab_test_subject_b: abTestSubjectB,
        })
        .select()
        .single();

      if (saveErrorB) {
        console.error('[SEND CAMPAIGN] Error saving variant B:', saveErrorB);
      }

      // Retourner les résultats combinés
      return NextResponse.json({
        success: true,
        totalSent: totalSentA + totalSentB,
        totalFailed: totalFailedA + totalFailedB,
        results: [...resultsA, ...resultsB],
        abTest: {
          variantA: {
            sent: totalSentA,
            failed: totalFailedA,
            subject: abTestSubjectA,
            campaignId: campaignA?.id,
          },
          variantB: {
            sent: totalSentB,
            failed: totalFailedB,
            subject: abTestSubjectB,
            campaignId: campaignB?.id,
          },
        },
      });
    }

    // 7. Envoi normal (sans A/B testing)
    console.log(
      `[SEND CAMPAIGN] Sending ${finalRecipients.length} emails (template: ${templateType}, segment: ${segment}, testMode: ${testMode})`
    );

    const results = await sendEmailBatch({
      recipients: finalRecipients,
      templateType,
      subject,
      supabase,
    });

    // 8. Calculer les résultats
    const totalSent = results.filter((r) => r.status === 'sent').length;
    const totalFailed = results.filter((r) => r.status === 'failed').length;

    // 9. Sauvegarder dans l'historique (sauf en mode test)
    if (!testMode) {
      const { error: saveError } = await supabase.from('email_campaigns').insert({
        template_type: templateType,
        subject,
        segment,
        total_sent: totalSent,
        total_failed: totalFailed,
        total_recipients: totalSent + totalFailed,
        sent_by: adminUser.email,
        results: results,
        ab_test_enabled: false,
      });

      if (saveError) {
        console.error('[SEND CAMPAIGN] Error saving to history:', saveError);
        // Continue anyway, l'email est envoyé même si l'historique ne se sauvegarde pas
      }
    }

    // 10. Retourner les résultats
    return NextResponse.json({
      success: true,
      totalSent,
      totalFailed,
      results,
    });
  } catch (error) {
    console.error('[SEND CAMPAIGN] Error:', error);

    // Erreur admin non authentifié
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}

/**
 * Envoyer un batch d'emails avec rate limiting
 */
async function sendEmailBatch({
  recipients,
  templateType,
  subject,
  supabase,
}: {
  recipients: any[];
  templateType: string;
  subject: string;
  supabase: any;
}) {
  const results: Array<{
    email: string;
    status: 'sent' | 'failed';
    id?: string;
    error?: string;
  }> = [];

  // Batch size pour respecter le rate limit de Resend (2 requests/sec initialement)
  const batchSize = 10;
  const delayBetweenBatches = 6000; // 6 secondes (10 emails / 6 sec = ~1.6 req/sec)

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (recipient: any) => {
        try {
          // Générer un token d'unsubscribe pour ce destinataire
          const { data: tokenData, error: tokenError } = await supabase.rpc(
            'generate_unsubscribe_token',
            { p_client_id: recipient.id }
          );

          if (tokenError) {
            console.error(`[SEND CAMPAIGN] Failed to generate unsubscribe token for ${recipient.email}:`, tokenError);
          }

          const unsubscribeToken = tokenData || undefined;

          // Rendre le template React Email selon templateType
          const htmlContent = await renderEmailTemplate({
            templateType,
            recipient,
            unsubscribeToken,
          });

          const result = await resend.emails.send({
            from: 'WelcomeApp <noreply@welcomeapp.be>',
            to: recipient.email,
            subject: subject,
            html: htmlContent,
          });

          // Logger l'événement dans analytics_events
          await supabase.from('analytics_events').insert({
            client_id: recipient.id,
            event_type: 'email_campaign_sent',
            metadata: {
              campaign_template: templateType,
              campaign_subject: subject,
            },
          });

          return {
            email: recipient.email,
            status: 'sent' as const,
            id: result.data?.id,
          };
        } catch (error) {
          console.error(`[SEND CAMPAIGN] Failed to send to ${recipient.email}:`, error);
          return {
            email: recipient.email,
            status: 'failed' as const,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    results.push(...batchResults);

    // Rate limiting : attendre entre chaque batch (sauf pour le dernier)
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
}

/**
 * Rendre un template React Email en HTML
 */
async function renderEmailTemplate({
  templateType,
  recipient,
  unsubscribeToken,
}: {
  templateType: string;
  recipient: any;
  unsubscribeToken?: string;
}): Promise<string> {
  const managerName = recipient.name || recipient.email.split('@')[0];
  const managerEmail = recipient.email;
  const slug = recipient.slug || 'demo';

  // Calculer les données dynamiques
  const daysSinceCreation = recipient.created_at
    ? Math.floor((Date.now() - new Date(recipient.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 7;

  switch (templateType) {
    case 'welcome':
      return render(
        WelcomeEmail({
          managerName,
          managerEmail,
          slug,
          unsubscribeToken,
        })
      );

    case 'inactive_reactivation':
      return render(
        InactiveReactivation({
          managerName,
          managerEmail,
          slug,
          daysSinceLastLogin: daysSinceCreation,
          totalTips: recipient.total_tips || 0,
          totalViews: recipient.total_views || 0,
          unsubscribeToken,
        })
      );

    case 'feature_announcement':
      return render(
        FeatureAnnouncement({
          managerName,
          managerEmail,
          featureName: 'QR Code Designer A4',
          featureDescription:
            'Créez des QR codes personnalisés et imprimez-les en format A4 pour afficher dans vos locations.',
          featureEmoji: '🎨',
          benefits: [
            'Design personnalisable avec votre branding',
            'Format A4 prêt à imprimer',
            'Génération instantanée',
            'Compatible tous navigateurs',
          ],
          ctaText: 'Créer mon QR Code',
          ctaUrl: 'https://welcomeapp.be/dashboard',
          unsubscribeToken,
        })
      );

    case 'newsletter':
      const currentMonth = new Date().toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      });
      return render(
        Newsletter({
          managerName,
          managerEmail,
          month: currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1),
          platformStats: {
            totalManagers: 150,
            totalTips: 1250,
            totalViews: 8500,
          },
          topFeatures: [
            {
              name: 'Smart Fill',
              description: 'Génération automatique de conseils par IA',
              emoji: '🤖',
            },
            {
              name: 'QR Code Designer',
              description: 'Création de QR codes personnalisés',
              emoji: '🎨',
            },
            {
              name: 'Analytics Dashboard',
              description: 'Suivi détaillé des performances',
              emoji: '📊',
            },
          ],
          tips: [
            {
              title: 'Utilisez des images de qualité',
              content:
                'Les photos HD augmentent l\'engagement de 40%. Pensez à compresser vos images pour optimiser le temps de chargement.',
            },
            {
              title: 'Mettez à jour régulièrement',
              content:
                'Ajoutez 1-2 nouveaux conseils par mois pour garder votre WelcomeBook frais et pertinent.',
            },
          ],
          unsubscribeToken,
        })
      );

    case 'tips_reminder':
      return render(
        TipsReminder({
          managerName,
          managerEmail,
          slug,
          currentTipsCount: recipient.total_tips || 0,
          daysSinceCreation,
          suggestedCategories: ['Restaurants', 'Activités', 'Transports', 'Infos pratiques', 'Lieux secrets'],
          unsubscribeToken,
        })
      );

    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }
}
