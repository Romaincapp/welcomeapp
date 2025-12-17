'use server';

import { Resend } from 'resend';
import { render } from '@react-email/components';
import { AdminAccountDeletedNotification } from '@/emails/templates/AdminAccountDeletedNotification';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendAccountDeletedNotificationParams {
  managerName: string;
  managerEmail: string;
  slug: string;
  welcomebookCount?: number;
}

export interface SendAccountDeletedNotificationResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Envoie une notification à contact@welcomeapp.be lorsqu'un gestionnaire supprime son compte
 *
 * @param params - Données du gestionnaire supprimé (nom, email, slug, nombre de welcomebooks)
 * @returns Résultat de l'envoi (success + emailId ou error)
 */
export async function sendAccountDeletedNotification(
  params: SendAccountDeletedNotificationParams
): Promise<SendAccountDeletedNotificationResult> {
  try {
    const { managerName, managerEmail, slug, welcomebookCount = 0 } = params;

    // Vérifier que tous les paramètres requis sont présents
    if (!managerName || !managerEmail || !slug) {
      return {
        success: false,
        error: 'Paramètres manquants pour envoyer la notification de suppression',
      };
    }

    // Rendre le template React Email en HTML
    const emailHtml = await render(
      AdminAccountDeletedNotification({
        managerName,
        managerEmail,
        slug,
        deletedAt: new Date().toISOString(),
        welcomebookCount,
      })
    );

    // Envoyer l'email via Resend à contact@welcomeapp.be
    const { data, error } = await resend.emails.send({
      from: 'WelcomeApp <hello@welcomeapp.be>',
      to: 'contact@welcomeapp.be',
      subject: `⚠️ Compte supprimé : ${managerName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Erreur envoi notification suppression compte:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi de la notification',
      };
    }

    console.log(`✅ Notification de suppression envoyée pour ${managerEmail} (ID: ${data?.id})`);

    return {
      success: true,
      emailId: data?.id,
    };
  } catch (error) {
    console.error('Erreur sendAccountDeletedNotification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
