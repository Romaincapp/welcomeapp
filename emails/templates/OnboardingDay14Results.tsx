import { Text, Heading, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface OnboardingDay14ResultsProps {
  managerName: string;
  managerEmail: string;
  slug: string;
  totalViews: number;
  totalClicks: number;
  totalTips: number;
  unsubscribeToken?: string;
}

/**
 * Email J+14 : Premiers résultats
 * Affiche les stats d'engagement (si disponibles)
 */
export function OnboardingDay14Results({
  managerName,
  managerEmail,
  slug,
  totalViews,
  totalClicks,
  totalTips,
  unsubscribeToken,
}: OnboardingDay14ResultsProps) {
  const dashboardUrl = 'https://welcomeapp.be/dashboard';
  const analyticsUrl = 'https://welcomeapp.be/dashboard/analytics';
  const hasActivity = totalViews > 0;

  return (
    <EmailLayout
      preview={`${managerName}, vos premiers résultats WelcomeApp !`}
      unsubscribeToken={unsubscribeToken}
    >
      <Heading style={h1}>Vos 2 premières semaines ! 📊</Heading>

      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        Deux semaines déjà sur WelcomeApp ! Voici un aperçu de votre activité :
      </Text>

      {/* Stats Cards */}
      <Section style={statsContainer}>
        <Section style={statCard}>
          <Text style={statNumber}>{totalTips}</Text>
          <Text style={statLabel}>Conseils</Text>
        </Section>

        <Section style={statCard}>
          <Text style={statNumber}>{totalViews}</Text>
          <Text style={statLabel}>Vues</Text>
        </Section>

        <Section style={statCard}>
          <Text style={statNumber}>{totalClicks}</Text>
          <Text style={statLabel}>Clics</Text>
        </Section>
      </Section>

      {/* Message conditionnel */}
      {hasActivity ? (
        <Section style={successBox}>
          <Heading style={h2}>🎉 Bravo, ça fonctionne !</Heading>
          <Text style={successText}>
            Vos voyageurs consultent votre WelcomeBook et cliquent sur vos recommandations.
            Continuez comme ça !
          </Text>
        </Section>
      ) : (
        <Section style={helpBox}>
          <Heading style={h2}>🤔 Pas encore de visites ?</Heading>
          <Text style={helpText}>
            Pas de panique ! Voici quelques actions pour booster votre visibilité :
          </Text>
          <Text style={helpList}>
            • Partagez le lien dans vos messages Airbnb/Booking<br />
            • Imprimez et affichez le QR code dans votre logement<br />
            • Ajoutez le lien dans votre annonce de location
          </Text>
        </Section>
      )}

      {/* CTA */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href={analyticsUrl} variant="primary">
          📈 Voir mes analytics détaillés
        </EmailButton>
      </Section>

      <Hr style={hr} />

      {/* Prochaine étape */}
      <Section style={nextStepBox}>
        <Heading style={h3}>🚀 Prochaine étape</Heading>
        <Text style={nextStepText}>
          La semaine prochaine, découvrez la <strong>Section Sécurisée</strong> :
          un espace protégé par code pour partager les infos sensibles (codes wifi,
          instructions d'arrivée, digicode...) avec vos voyageurs uniquement !
        </Text>
      </Section>

      <Text style={paragraph}>
        Continuez comme ça !
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
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 12px',
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

const statsContainer = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '24px',
  marginBottom: '24px',
};

const statCard = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
  width: '30%',
  display: 'inline-block',
  marginRight: '3%',
};

const statNumber = {
  color: '#4F46E5',
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '1',
  margin: '0 0 8px',
};

const statLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const successBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '8px',
  padding: '20px',
};

const successText = {
  color: '#166534',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
};

const helpBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '20px',
};

const helpText = {
  color: '#78350f',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const helpList = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const nextStepBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #93c5fd',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const nextStepText = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};
