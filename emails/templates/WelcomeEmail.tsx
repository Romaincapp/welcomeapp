import { Text, Heading, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface WelcomeEmailProps {
  managerName: string;
  managerEmail: string;
  slug: string;
  unsubscribeToken?: string;
}

/**
 * Email de bienvenue pour les nouveaux gestionnaires
 *
 * Envoyé automatiquement après l'inscription pour :
 * - Accueillir le gestionnaire
 * - Présenter les fonctionnalités principales
 * - Guider vers les premiers pas
 */
export function WelcomeEmail({
  managerName,
  managerEmail,
  slug,
  unsubscribeToken,
}: WelcomeEmailProps) {
  const welcomebookUrl = `https://welcomeapp.be/${slug}`;
  const dashboardUrl = 'https://welcomeapp.be/dashboard';

  return (
    <EmailLayout
      preview={`Bienvenue sur WelcomeApp, ${managerName} !`}
      unsubscribeToken={unsubscribeToken}
    >
      {/* En-tête principale */}
      <Heading style={h1}>Bienvenue sur WelcomeApp ! 👋</Heading>

      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        Nous sommes ravis de vous accueillir sur WelcomeApp, la plateforme qui transforme
        vos locations de vacances en expériences inoubliables pour vos voyageurs.
      </Text>

      {/* Section : Votre WelcomeBook */}
      <Section style={card}>
        <Heading style={h2}>🏠 Votre WelcomeBook est prêt !</Heading>
        <Text style={cardText}>
          Votre guide personnalisé est accessible dès maintenant :
        </Text>
        <Text style={urlBox}>
          <a href={welcomebookUrl} style={link}>
            {welcomebookUrl}
          </a>
        </Text>
        <Text style={cardText}>
          Partagez ce lien avec vos voyageurs pour leur offrir une expérience unique !
        </Text>
      </Section>

      {/* Section : Premiers pas */}
      <Section style={{ marginTop: '32px' }}>
        <Heading style={h2}>🚀 Par où commencer ?</Heading>

        <Section style={featureBox}>
          <Text style={featureTitle}>1️⃣ Personnalisez votre header</Text>
          <Text style={featureText}>
            Ajoutez une photo de votre propriété et personnalisez les couleurs pour
            refléter l'identité de votre location.
          </Text>
        </Section>

        <Section style={featureBox}>
          <Text style={featureTitle}>2️⃣ Ajoutez vos premiers conseils</Text>
          <Text style={featureText}>
            Partagez vos bonnes adresses : restaurants, activités, lieux secrets...
            Vos voyageurs vous en seront reconnaissants !
          </Text>
        </Section>

        <Section style={featureBox}>
          <Text style={featureTitle}>3️⃣ Utilisez le Smart Fill</Text>
          <Text style={featureText}>
            Gagnez du temps ! Notre IA génère automatiquement des conseils personnalisés
            basés sur votre localisation.
          </Text>
        </Section>
      </Section>

      {/* Call to Action - 2 boutons distincts */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <Text style={ctaTitle}>👉 Commencez dès maintenant :</Text>

        {/* Bouton 1 : Dashboard */}
        <EmailButton href={dashboardUrl} variant="primary">
          🎨 Accéder à mon Dashboard
        </EmailButton>

        <Text style={ctaSeparator}>ou</Text>

        {/* Bouton 2 : WelcomeBook */}
        <EmailButton href={welcomebookUrl} variant="secondary">
          📖 Voir mon WelcomeBook
        </EmailButton>
      </Section>

      <Hr style={hr} />

      {/* Section : Fonctionnalités clés */}
      <Section>
        <Heading style={h2}>✨ Ce que vous pouvez faire avec WelcomeApp</Heading>

        <Text style={bulletPoint}>
          ✅ <strong>Guides interactifs</strong> - Cartes, itinéraires, infos pratiques
        </Text>
        <Text style={bulletPoint}>
          ✅ <strong>Multilingue</strong> - Traduction automatique en 100+ langues
        </Text>
        <Text style={bulletPoint}>
          ✅ <strong>QR Code personnalisé</strong> - À imprimer et afficher dans votre logement
        </Text>
        <Text style={bulletPoint}>
          ✅ <strong>Analytics</strong> - Suivez les visites et l'engagement de vos voyageurs
        </Text>
        <Text style={bulletPoint}>
          ✅ <strong>PWA installable</strong> - Vos voyageurs peuvent l'installer sur leur téléphone
        </Text>
      </Section>

      {/* Section : Besoin d'aide */}
      <Section style={helpBox}>
        <Text style={helpText}>
          <strong>💡 Besoin d'aide ?</strong>
          <br />
          Notre équipe est là pour vous accompagner. Répondez simplement à cet email
          et nous vous aiderons à créer le WelcomeBook parfait !
        </Text>
      </Section>

      {/* Closing */}
      <Text style={paragraph}>
        À très bientôt,
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
  backgroundColor: '#f0f9ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
};

const cardText = {
  color: '#1e40af',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const urlBox = {
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  padding: '12px',
  margin: '12px 0',
  textAlign: 'center' as const,
};

const link = {
  color: '#4F46E5',
  textDecoration: 'none',
  fontWeight: '500',
};

const featureBox = {
  marginBottom: '16px',
};

const featureTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 6px',
};

const featureText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 0 24px',
};

const bulletPoint = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '0 0 8px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const helpBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '24px',
};

const helpText = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};

const ctaTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 20px',
};

const ctaSeparator = {
  color: '#9ca3af',
  fontSize: '14px',
  fontWeight: '500',
  margin: '16px 0',
};
