'use server';

import { Resend } from 'resend';
import { render } from '@react-email/components';
import { AdminAppExpiredNotification } from '@/emails/templates/AdminAppExpiredNotification';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendAppExpiredNotificationParams {
  managerName: string;
  managerEmail: string;
  slug: string;
  accountStatus: 'grace_period' | 'suspended';
  suspendedAt?: string;
  creditsBalance: number;
  lastCreditConsumption?: string;
}

export interface SendAppExpiredNotificationResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Envoie une notification à contact@welcomeapp.be lorsqu'une app expire (crédits épuisés)
 *
 * @param params - Données du gestionnaire et statut de l'app
 * @returns Résultat de l'envoi (success + emailId ou error)
 */
export async function sendAppExpiredNotification(
  params: SendAppExpiredNotificationParams
): Promise<SendAppExpiredNotificationResult> {
  try {
    const {
      managerName,
      managerEmail,
      slug,
      accountStatus,
      suspendedAt,
      creditsBalance,
      lastCreditConsumption,
    } = params;

    // Vérifier que tous les paramètres requis sont présents
    if (!managerName || !managerEmail || !slug || !accountStatus) {
      return {
        success: false,
        error: 'Paramètres manquants pour envoyer la notification d\'expiration',
      };
    }

    const isGracePeriod = accountStatus === 'grace_period';
    const statusLabel = isGracePeriod ? 'Période de grâce' : 'Suspendu';

    // Rendre le template React Email en HTML
    const emailHtml = await render(
      AdminAppExpiredNotification({
        managerName,
        managerEmail,
        slug,
        accountStatus,
        suspendedAt,
        creditsBalance,
        lastCreditConsumption,
      })
    );

    // Envoyer l'email via Resend à contact@welcomeapp.be
    const { data, error } = await resend.emails.send({
      from: 'WelcomeApp <hello@welcomeapp.be>',
      to: 'contact@welcomeapp.be',
      subject: `${isGracePeriod ? '⚠️' : '🚫'} App ${statusLabel} : ${managerName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Erreur envoi notification expiration app:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi de la notification',
      };
    }

    console.log(
      `✅ Notification d'expiration envoyée pour ${managerEmail} (${statusLabel}, ID: ${data?.id})`
    );

    return {
      success: true,
      emailId: data?.id,
    };
  } catch (error) {
    console.error('Erreur sendAppExpiredNotification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
