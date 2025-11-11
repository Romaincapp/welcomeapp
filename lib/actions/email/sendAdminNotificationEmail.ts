'use server';

import { Resend } from 'resend';
import { render } from '@react-email/components';
import { AdminNewWelcomebookNotification } from '@/emails/templates/AdminNewWelcomebookNotification';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendAdminNotificationEmailParams {
  managerName: string;
  managerEmail: string;
  slug: string;
  createdAt: string;
}

export interface SendAdminNotificationEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Envoie une notification à l'admin lors de la création d'un nouveau welcomebook
 *
 * @param params - Données du gestionnaire (nom, email, slug, date)
 * @returns Résultat de l'envoi (success + emailId ou error)
 */
export async function sendAdminNotificationEmail(
  params: SendAdminNotificationEmailParams
): Promise<SendAdminNotificationEmailResult> {
  try {
    const { managerName, managerEmail, slug, createdAt } = params;

    // Vérifier que tous les paramètres sont présents
    if (!managerName || !managerEmail || !slug || !createdAt) {
      return {
        success: false,
        error: 'Paramètres manquants pour envoyer la notification admin',
      };
    }

    // Rendre le template React Email en HTML
    const emailHtml = await render(
      AdminNewWelcomebookNotification({
        managerName,
        managerEmail,
        slug,
        createdAt,
      })
    );

    // Envoyer l'email via Resend à l'adresse admin
    const { data, error } = await resend.emails.send({
      from: 'WelcomeApp <noreply@welcomeapp.be>',
      to: 'contact@welcomeapp.be',
      subject: `Nouveau WelcomeBook créé : ${managerName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Erreur envoi notification admin:', error);
      return {
        success: false,
        error: error.message || "Erreur lors de l'envoi de la notification",
      };
    }

    return {
      success: true,
      emailId: data?.id,
    };
  } catch (error) {
    console.error('Erreur sendAdminNotificationEmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
