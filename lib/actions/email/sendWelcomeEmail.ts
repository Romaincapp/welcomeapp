'use server';

import { Resend } from 'resend';
import { render } from '@react-email/components';
import { WelcomeEmail } from '@/emails/templates/WelcomeEmail';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendWelcomeEmailParams {
  managerName: string;
  managerEmail: string;
  slug: string;
  clientId: string;
}

export interface SendWelcomeEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Envoie l'email de bienvenue automatiquement après inscription
 *
 * @param params - Données du gestionnaire (nom, email, slug, clientId)
 * @returns Résultat de l'envoi (success + emailId ou error)
 */
export async function sendWelcomeEmail(
  params: SendWelcomeEmailParams
): Promise<SendWelcomeEmailResult> {
  try {
    const { managerName, managerEmail, slug, clientId } = params;

    // Vérifier que tous les paramètres sont présents
    if (!managerName || !managerEmail || !slug || !clientId) {
      return {
        success: false,
        error: 'Paramètres manquants pour envoyer l\'email de bienvenue',
      };
    }

    // Créer le client Supabase
    const supabase = await createServerSupabaseClient();

    // Générer un token d'unsubscribe pour ce gestionnaire
    const { data: tokenData, error: tokenError } = await supabase.rpc(
      'generate_unsubscribe_token',
      { p_client_id: clientId }
    );

    if (tokenError) {
      console.error('Erreur génération token unsubscribe:', tokenError);
      // On continue quand même l'envoi sans token (pas bloquant)
    }

    const unsubscribeToken = tokenData || undefined;

    // Rendre le template React Email en HTML
    const emailHtml = await render(
      WelcomeEmail({
        managerName,
        managerEmail,
        slug,
        unsubscribeToken,
      })
    );

    // Envoyer l'email via Resend
    const { data, error } = await resend.emails.send({
      from: 'WelcomeApp <hello@welcomeapp.be>',
      to: managerEmail,
      subject: `Bienvenue sur WelcomeApp, ${managerName} ! 👋`,
      html: emailHtml,
    });

    if (error) {
      console.error('Erreur envoi email welcome:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi de l\'email',
      };
    }

    // Note: On ne track pas l'email de bienvenue dans email_events car c'est un email
    // transactionnel (pas une campagne marketing). La table email_events requiert un campaign_id.

    return {
      success: true,
      emailId: data?.id,
    };
  } catch (error) {
    console.error('Erreur sendWelcomeEmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
