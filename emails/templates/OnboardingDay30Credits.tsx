import { Text, Heading, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface OnboardingDay30CreditsProps {
  managerName: string;
  managerEmail: string;
  slug: string;
  currentCredits: number;
  unsubscribeToken?: string;
}

/**
 * Email J+30 : Système de crédits et partage social
 * Présente comment gagner des crédits gratuits
 */
export function OnboardingDay30Credits({
  managerName,
  managerEmail,
  slug,
  currentCredits,
  unsubscribeToken,
}: OnboardingDay30CreditsProps) {
  const creditsUrl = 'https://welcomeapp.be/dashboard/credits';
  const earnUrl = 'https://welcomeapp.be/dashboard/credits/earn';

  return (
    <EmailLayout
      preview={`${managerName}, gagnez des crédits gratuits !`}
      unsubscribeToken={unsubscribeToken}
    >
      <Heading style={h1}>Gagnez des crédits gratuits ! 🎁</Heading>

      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        Un mois déjà sur WelcomeApp ! Saviez-vous que vous pouvez prolonger
        votre utilisation gratuitement en partageant votre expérience ?
      </Text>

      {/* Balance actuelle */}
      <Section style={balanceCard}>
        <Text style={balanceLabel}>Votre solde actuel</Text>
        <Text style={balanceNumber}>{currentCredits}</Text>
        <Text style={balanceUnit}>crédits</Text>
      </Section>

      {/* Comment gagner */}
      <Section style={card}>
        <Heading style={h2}>🚀 Comment gagner des crédits ?</Heading>
        <Text style={cardText}>
          Partagez WelcomeApp sur les réseaux sociaux et gagnez jusqu'à
          <strong> 135 jours de crédits</strong> par partage !
        </Text>

        <Section style={{ marginTop: '20px' }}>
          <Section style={platformRow}>
            <Text style={platformEmoji}>💼</Text>
            <Text style={platformName}>LinkedIn</Text>
            <Text style={platformCredits}>+45 à +135 jours</Text>
          </Section>

          <Section style={platformRow}>
            <Text style={platformEmoji}>📸</Text>
            <Text style={platformName}>Instagram</Text>
            <Text style={platformCredits}>+30 à +90 jours</Text>
          </Section>

          <Section style={platformRow}>
            <Text style={platformEmoji}>👍</Text>
            <Text style={platformName}>Facebook</Text>
            <Text style={platformCredits}>+30 à +90 jours</Text>
          </Section>

          <Section style={platformRow}>
            <Text style={platformEmoji}>🐦</Text>
            <Text style={platformName}>Twitter/X</Text>
            <Text style={platformCredits}>+30 à +90 jours</Text>
          </Section>
        </Section>

        <Text style={cardTextSmall}>
          Plus votre post est personnalisé, plus vous gagnez de crédits !
        </Text>
      </Section>

      {/* Comment ça marche */}
      <Section style={{ marginTop: '32px' }}>
        <Heading style={h2}>📱 C'est simple :</Heading>

        <Section style={stepBox}>
          <Text style={stepNumber}>1</Text>
          <Text style={stepText}>
            Choisissez un template de post pré-rédigé ou personnalisez-le
          </Text>
        </Section>

        <Section style={stepBox}>
          <Text style={stepNumber}>2</Text>
          <Text style={stepText}>
            Publiez sur le réseau social de votre choix
          </Text>
        </Section>

        <Section style={stepBox}>
          <Text style={stepNumber}>3</Text>
          <Text style={stepText}>
            Déclarez votre partage et recevez vos crédits automatiquement !
          </Text>
        </Section>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href={earnUrl} variant="primary">
          🎁 Gagner des crédits
        </EmailButton>

        <Text style={ctaSeparator}>ou</Text>

        <EmailButton href={creditsUrl} variant="secondary">
          📊 Voir mon solde
        </EmailButton>
      </Section>

      <Hr style={hr} />

      {/* Tip */}
      <Section style={tipBox}>
        <Text style={tipText}>
          <strong>💡 Astuce :</strong> Les posts les plus appréciés sont ceux qui
          racontent une vraie expérience ! Parlez de comment WelcomeApp vous a
          fait gagner du temps avec vos voyageurs.
        </Text>
      </Section>

      <Text style={paragraph}>
        Merci de faire partie de la communauté WelcomeApp !
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
  margin: '0 0 16px',
};

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const balanceCard = {
  backgroundColor: '#4F46E5',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  marginTop: '24px',
  marginBottom: '24px',
};

const balanceLabel = {
  color: '#c7d2fe',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const balanceNumber = {
  color: '#ffffff',
  fontSize: '48px',
  fontWeight: '700',
  lineHeight: '1',
  margin: '0',
};

const balanceUnit = {
  color: '#c7d2fe',
  fontSize: '16px',
  margin: '8px 0 0',
};

const card = {
  backgroundColor: '#fefce8',
  border: '1px solid #fde047',
  borderRadius: '8px',
  padding: '24px',
};

const cardText = {
  color: '#713f12',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
};

const cardTextSmall = {
  color: '#854d0e',
  fontSize: '13px',
  fontStyle: 'italic',
  margin: '16px 0 0',
};

const platformRow = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #fef08a',
};

const platformEmoji = {
  fontSize: '20px',
  width: '32px',
  margin: '0',
};

const platformName = {
  color: '#713f12',
  fontSize: '15px',
  fontWeight: '500',
  flex: '1',
  margin: '0',
};

const platformCredits = {
  color: '#166534',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const stepBox = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '12px',
};

const stepNumber = {
  backgroundColor: '#4F46E5',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  textAlign: 'center' as const,
  lineHeight: '28px',
  margin: '0 12px 0 0',
  display: 'inline-block',
};

const stepText = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.5',
  margin: '0',
  display: 'inline-block',
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

const tipBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const tipText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};
