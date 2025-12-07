import { Text, Heading, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface OnboardingDay21SecureSectionProps {
  managerName: string;
  managerEmail: string;
  slug: string;
  hasSecureSection: boolean;
  unsubscribeToken?: string;
}

/**
 * Email J+21 : Découverte de la Section Sécurisée
 * Présente la fonctionnalité de section protégée par code
 */
export function OnboardingDay21SecureSection({
  managerName,
  managerEmail,
  slug,
  hasSecureSection,
  unsubscribeToken,
}: OnboardingDay21SecureSectionProps) {
  const welcomebookUrl = `https://welcomeapp.be/${slug}`;

  return (
    <EmailLayout
      preview={`${managerName}, protégez vos infos sensibles !`}
      unsubscribeToken={unsubscribeToken}
    >
      <Heading style={h1}>Astuce Pro : Section Sécurisée 🔐</Heading>

      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        Vous avez des informations à partager avec vos voyageurs mais que vous
        ne voulez pas rendre publiques ? La <strong>Section Sécurisée</strong>
        est faite pour ça !
      </Text>

      {/* Section principale */}
      <Section style={card}>
        <Heading style={h2}>🔒 Qu'est-ce que c'est ?</Heading>
        <Text style={cardText}>
          Un espace protégé par un code PIN que vous choisissez. Seuls vos voyageurs
          avec le code peuvent accéder aux informations.
        </Text>

        <Section style={{ marginTop: '20px' }}>
          <Text style={featureTitle}>Parfait pour :</Text>
          <Text style={featureItem}>📶 Code WiFi et mot de passe</Text>
          <Text style={featureItem}>🚪 Digicode / code de la porte</Text>
          <Text style={featureItem}>🅿️ Instructions parking</Text>
          <Text style={featureItem}>🗝️ Emplacement des clés</Text>
          <Text style={featureItem}>⏰ Horaires check-in/check-out</Text>
          <Text style={featureItem}>📞 Numéros d'urgence</Text>
        </Section>
      </Section>

      {/* Comment ça marche */}
      <Section style={{ marginTop: '32px' }}>
        <Heading style={h2}>📱 Comment ça marche ?</Heading>

        <Section style={stepBox}>
          <Text style={stepNumber}>1</Text>
          <Text style={stepText}>
            Activez la section sécurisée depuis le menu <strong>+</strong>
          </Text>
        </Section>

        <Section style={stepBox}>
          <Text style={stepNumber}>2</Text>
          <Text style={stepText}>
            Choisissez un code PIN (ex: 1234, date d'arrivée...)
          </Text>
        </Section>

        <Section style={stepBox}>
          <Text style={stepNumber}>3</Text>
          <Text style={stepText}>
            Ajoutez vos infos sensibles (wifi, codes, instructions...)
          </Text>
        </Section>

        <Section style={stepBox}>
          <Text style={stepNumber}>4</Text>
          <Text style={stepText}>
            Partagez le code PIN avec vos voyageurs dans votre message de bienvenue
          </Text>
        </Section>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        {hasSecureSection ? (
          <Text style={alreadyActiveText}>
            ✅ Vous avez déjà activé votre section sécurisée, bravo !
          </Text>
        ) : (
          <EmailButton href={welcomebookUrl} variant="primary">
            🔐 Activer ma Section Sécurisée
          </EmailButton>
        )}
      </Section>

      <Hr style={hr} />

      {/* Tip */}
      <Section style={tipBox}>
        <Text style={tipText}>
          <strong>💡 Astuce :</strong> Utilisez une date facile à retenir comme code PIN
          (date d'arrivée du voyageur, année de construction...) et mentionnez-le dans
          votre message Airbnb/Booking !
        </Text>
      </Section>

      <Text style={paragraph}>
        La semaine prochaine, découvrez comment gagner des crédits gratuits !
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

const card = {
  backgroundColor: '#fdf2f8',
  border: '1px solid #f9a8d4',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
};

const cardText = {
  color: '#9d174d',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
};

const featureTitle = {
  color: '#9d174d',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const featureItem = {
  color: '#be185d',
  fontSize: '14px',
  lineHeight: '2',
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

const alreadyActiveText = {
  color: '#166534',
  fontSize: '16px',
  fontWeight: '600',
  backgroundColor: '#dcfce7',
  padding: '12px 20px',
  borderRadius: '8px',
  display: 'inline-block',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
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
