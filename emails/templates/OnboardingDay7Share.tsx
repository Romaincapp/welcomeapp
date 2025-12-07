import { Text, Heading, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface OnboardingDay7ShareProps {
  managerName: string;
  managerEmail: string;
  slug: string;
  currentTipsCount: number;
  unsubscribeToken?: string;
}

/**
 * Email J+7 : Partage avec les voyageurs
 * Guide QR code, lien, PWA
 */
export function OnboardingDay7Share({
  managerName,
  managerEmail,
  slug,
  currentTipsCount,
  unsubscribeToken,
}: OnboardingDay7ShareProps) {
  const welcomebookUrl = `https://welcomeapp.be/${slug}`;
  const dashboardUrl = 'https://welcomeapp.be/dashboard';

  return (
    <EmailLayout
      preview={`${managerName}, partagez votre WelcomeBook avec vos voyageurs !`}
      unsubscribeToken={unsubscribeToken}
    >
      <Heading style={h1}>Partagez avec vos voyageurs ! 📤</Heading>

      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        Une semaine déjà ! Votre WelcomeBook contient maintenant{' '}
        <strong>{currentTipsCount} conseil(s)</strong>.
        Il est temps de le partager avec vos voyageurs pour qu'ils en profitent !
      </Text>

      {/* Section : 3 façons de partager */}
      <Section style={card}>
        <Heading style={h2}>🚀 3 façons de partager</Heading>

        <Section style={methodBox}>
          <Text style={methodEmoji}>📱</Text>
          <Section style={methodContent}>
            <Text style={methodTitle}>QR Code imprimable</Text>
            <Text style={methodText}>
              Créez une affiche A4 design à imprimer et afficher dans votre logement.
              Vos voyageurs scannent et accèdent instantanément au guide !
            </Text>
          </Section>
        </Section>

        <Section style={methodBox}>
          <Text style={methodEmoji}>🔗</Text>
          <Section style={methodContent}>
            <Text style={methodTitle}>Lien direct</Text>
            <Text style={methodText}>
              Copiez et envoyez le lien par SMS, WhatsApp ou dans vos messages Airbnb.
              <br />
              <span style={linkDisplay}>{welcomebookUrl}</span>
            </Text>
          </Section>
        </Section>

        <Section style={methodBox}>
          <Text style={methodEmoji}>📧</Text>
          <Section style={methodContent}>
            <Text style={methodTitle}>Email automatique</Text>
            <Text style={methodText}>
              Intégrez le lien dans votre message de confirmation de réservation
              pour que vos voyageurs l'aient avant même d'arriver !
            </Text>
          </Section>
        </Section>
      </Section>

      {/* CTA - QR Designer */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href={`${dashboardUrl}/qr-designer`} variant="primary">
          🎨 Créer mon QR Code design
        </EmailButton>

        <Text style={ctaSeparator}>ou</Text>

        <EmailButton href={dashboardUrl} variant="secondary">
          📤 Voir options de partage
        </EmailButton>
      </Section>

      <Hr style={hr} />

      {/* PWA */}
      <Section style={pwaBox}>
        <Heading style={h3}>📲 Bonus : Installation PWA</Heading>
        <Text style={pwaText}>
          Vos voyageurs peuvent <strong>installer</strong> votre WelcomeBook comme une app
          sur leur téléphone ! Une notification leur proposera automatiquement après
          quelques secondes de navigation.
        </Text>
      </Section>

      {/* Tip */}
      <Section style={tipBox}>
        <Text style={tipText}>
          <strong>💡 Conseil pro :</strong> Placez le QR code à un endroit visible
          dès l'entrée (porte, table du salon, frigo) pour que vos voyageurs le
          voient immédiatement !
        </Text>
      </Section>

      <Text style={paragraph}>
        La semaine prochaine, on vous montrera vos premières statistiques !
        <br /><br />
        L'équipe WelcomeApp
      </Text>
    </EmailLayout>
  );
}

// Styles
const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 20px',
};

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 20px',
};

const h3 = {
  color: '#1f2937',
  fontSize: '17px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 12px',
};

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const card = {
  backgroundColor: '#f0fdfa',
  border: '1px solid #5eead4',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
};

const methodBox = {
  display: 'flex',
  marginBottom: '20px',
};

const methodEmoji = {
  fontSize: '28px',
  margin: '0 16px 0 0',
  lineHeight: '1',
};

const methodContent = {
  flex: '1',
};

const methodTitle = {
  color: '#0f766e',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 6px',
};

const methodText = {
  color: '#115e59',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const linkDisplay = {
  backgroundColor: '#ccfbf1',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontFamily: 'monospace',
};

const ctaSeparator = {
  color: '#9ca3af',
  fontSize: '14px',
  fontWeight: '500',
  margin: '16px 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const pwaBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #93c5fd',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
};

const pwaText = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};

const tipBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const tipText = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};
