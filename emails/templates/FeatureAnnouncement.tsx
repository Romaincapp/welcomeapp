import { Text, Heading, Section, Hr, Img } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface FeatureAnnouncementProps {
  managerName: string;
  managerEmail: string;
  featureName: string;
  featureDescription: string;
  featureEmoji?: string;
  benefits?: string[];
  ctaText?: string;
  ctaUrl?: string;
}

/**
 * Email d'annonce de nouvelles fonctionnalités
 *
 * Envoyé lors du lancement d'une nouvelle feature pour :
 * - Informer les gestionnaires des nouveautés
 * - Expliquer les bénéfices
 * - Encourager l'adoption
 */
export function FeatureAnnouncement({
  managerName,
  managerEmail,
  featureName,
  featureDescription,
  featureEmoji = '✨',
  benefits = [],
  ctaText = 'Découvrir la nouveauté',
  ctaUrl = 'https://welcomeapp.be/dashboard',
}: FeatureAnnouncementProps) {
  return (
    <EmailLayout
      preview={`Nouvelle fonctionnalité : ${featureName}`}
      unsubscribeEmail={managerEmail}
    >
      {/* Badge "Nouveau" */}
      <Section style={badgeContainer}>
        <Text style={badge}>🎉 NOUVEAU</Text>
      </Section>

      {/* En-tête principale */}
      <Heading style={h1}>
        {featureEmoji} {featureName}
      </Heading>

      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        Nous sommes ravis de vous présenter notre toute dernière fonctionnalité,
        conçue pour rendre votre WelcomeApp encore plus puissant !
      </Text>

      {/* Section : Description de la feature */}
      <Section style={featureCard}>
        <Text style={featureCardTitle}>🚀 Qu'est-ce que c'est ?</Text>
        <Text style={featureCardText}>{featureDescription}</Text>
      </Section>

      {/* Section : Bénéfices */}
      {benefits.length > 0 && (
        <Section style={{ marginTop: '32px' }}>
          <Heading style={h2}>💎 Pourquoi c'est génial pour vous :</Heading>

          {benefits.map((benefit, index) => (
            <Section key={index} style={benefitBox}>
              <Text style={benefitIcon}>✓</Text>
              <Text style={benefitText}>{benefit}</Text>
            </Section>
          ))}
        </Section>
      )}

      {/* Call to Action */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href={ctaUrl} variant="primary">
          {ctaText}
        </EmailButton>
      </Section>

      <Hr style={hr} />

      {/* Section : Comment ça marche */}
      <Section style={howToCard}>
        <Heading style={h2}>🎯 Comment l'utiliser ?</Heading>

        <Text style={stepText}>
          <strong>Étape 1 :</strong> Connectez-vous à votre tableau de bord
        </Text>
        <Text style={stepText}>
          <strong>Étape 2 :</strong> Recherchez la nouvelle fonctionnalité dans le menu
        </Text>
        <Text style={stepText}>
          <strong>Étape 3 :</strong> Suivez les instructions intuitives
        </Text>
        <Text style={stepText}>
          <strong>Étape 4 :</strong> Profitez des bénéfices immédiatement !
        </Text>
      </Section>

      {/* Section : Feedback */}
      <Section style={feedbackBox}>
        <Text style={feedbackText}>
          <strong>💬 Votre avis compte !</strong>
          <br />
          <br />
          Vous avez des questions ou des suggestions ? Nous serions ravis d'avoir
          votre retour sur cette nouvelle fonctionnalité.
          <br />
          <br />
          Répondez simplement à cet email et partagez-nous votre expérience !
        </Text>
      </Section>

      {/* Section : Roadmap teaser */}
      <Section style={roadmapBox}>
        <Text style={roadmapTitle}>👀 En préparation...</Text>
        <Text style={roadmapText}>
          Ce n'est que le début ! D'autres fonctionnalités passionnantes arrivent
          bientôt pour améliorer encore plus votre expérience WelcomeApp.
        </Text>
        <Text style={roadmapText}>
          Restez connecté pour ne rien manquer ! 🚀
        </Text>
      </Section>

      {/* Closing */}
      <Text style={paragraph}>
        Bonne découverte,
        <br />
        L'équipe WelcomeApp
      </Text>

      {/* P.S. */}
      <Text style={psText}>
        <strong>P.S.</strong> Partagez cette nouveauté avec vos confrères gestionnaires
        de locations. Ensemble, nous créons les meilleures expériences pour les voyageurs !
      </Text>
    </EmailLayout>
  );
}

// Styles
const badgeContainer = {
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const badge = {
  display: 'inline-block',
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '700',
  padding: '6px 16px',
  borderRadius: '20px',
  margin: '0',
  letterSpacing: '0.5px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '1.2',
  margin: '0 0 20px',
  textAlign: 'center' as const,
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

const featureCard = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  padding: '24px',
  marginTop: '24px',
};

const featureCardTitle = {
  color: '#1e40af',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const featureCardText = {
  color: '#1e40af',
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '0',
};

const benefitBox = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  marginBottom: '12px',
};

const benefitIcon = {
  color: '#10b981',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
  flexShrink: 0,
};

const benefitText = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const howToCard = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '20px',
};

const stepText = {
  color: '#78350f',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '0 0 10px',
};

const feedbackBox = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '24px',
};

const feedbackText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.7',
  margin: '0',
};

const roadmapBox = {
  backgroundColor: '#faf5ff',
  border: '1px solid #c084fc',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '24px',
};

const roadmapTitle = {
  color: '#6b21a8',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const roadmapText = {
  color: '#7c3aed',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 10px',
};

const psText = {
  color: '#6b7280',
  fontSize: '14px',
  fontStyle: 'italic',
  lineHeight: '1.6',
  margin: '24px 0 0',
  paddingTop: '24px',
  borderTop: '1px solid #e5e7eb',
};
