import { Text, Heading, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface OnboardingDay1SmartFillProps {
  managerName: string;
  managerEmail: string;
  slug: string;
  currentTipsCount: number;
  unsubscribeToken?: string;
}

/**
 * Email J+1 : Découverte du Smart Fill IA
 * Envoyé 1 jour après l'inscription pour rappeler la fonctionnalité clé
 */
export function OnboardingDay1SmartFill({
  managerName,
  managerEmail,
  slug,
  currentTipsCount,
  unsubscribeToken,
}: OnboardingDay1SmartFillProps) {
  const dashboardUrl = 'https://welcomeapp.be/dashboard';
  const welcomebookUrl = `https://welcomeapp.be/${slug}`;

  return (
    <EmailLayout
      preview={`${managerName}, avez-vous testé le Smart Fill ?`}
      unsubscribeToken={unsubscribeToken}
    >
      <Heading style={h1}>Avez-vous testé le Smart Fill ? 🤖</Heading>

      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        Hier vous avez créé votre WelcomeBook - félicitations ! 🎉
        {currentTipsCount > 0
          ? ` Vous avez déjà ${currentTipsCount} conseil(s), c'est un super début !`
          : ' Maintenant, laissez notre IA faire le travail pour vous.'}
      </Text>

      {/* Section principale : Smart Fill */}
      <Section style={card}>
        <Heading style={h2}>✨ Le Smart Fill en 10 secondes</Heading>
        <Text style={cardText}>
          Notre intelligence artificielle analyse votre localisation et génère
          automatiquement des recommandations personnalisées :
        </Text>

        <Section style={featureList}>
          <Text style={featureItem}>🍽️ Restaurants et cafés populaires</Text>
          <Text style={featureItem}>🎯 Activités et lieux touristiques</Text>
          <Text style={featureItem}>🏥 Services pratiques (pharmacie, supermarché...)</Text>
          <Text style={featureItem}>🚗 Transports et accès</Text>
        </Section>

        <Text style={cardTextSmall}>
          Tout ça avec les notes Google, photos et horaires d'ouverture !
        </Text>
      </Section>

      {/* Comment faire */}
      <Section style={{ marginTop: '32px' }}>
        <Heading style={h2}>📱 Comment utiliser le Smart Fill ?</Heading>

        <Section style={stepBox}>
          <Text style={stepNumber}>1</Text>
          <Text style={stepText}>
            Ouvrez votre WelcomeBook en mode édition
          </Text>
        </Section>

        <Section style={stepBox}>
          <Text style={stepNumber}>2</Text>
          <Text style={stepText}>
            Cliquez sur le menu <strong>+</strong> en haut à droite
          </Text>
        </Section>

        <Section style={stepBox}>
          <Text style={stepNumber}>3</Text>
          <Text style={stepText}>
            Sélectionnez <strong>"Remplissage auto"</strong>
          </Text>
        </Section>

        <Section style={stepBox}>
          <Text style={stepNumber}>4</Text>
          <Text style={stepText}>
            Choisissez les catégories et laissez l'IA travailler !
          </Text>
        </Section>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href={dashboardUrl} variant="primary">
          🚀 Essayer le Smart Fill
        </EmailButton>
      </Section>

      <Hr style={hr} />

      {/* Tip du jour */}
      <Section style={tipBox}>
        <Text style={tipText}>
          <strong>💡 Astuce :</strong> Vous pouvez toujours modifier ou supprimer
          les conseils générés par l'IA pour les personnaliser selon vos préférences.
        </Text>
      </Section>

      <Text style={paragraph}>
        À demain pour plus d'astuces !
        <br />
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
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
};

const cardText = {
  color: '#166534',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const cardTextSmall = {
  color: '#166534',
  fontSize: '13px',
  fontStyle: 'italic',
  margin: '16px 0 0',
};

const featureList = {
  margin: '16px 0',
};

const featureItem = {
  color: '#15803d',
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
