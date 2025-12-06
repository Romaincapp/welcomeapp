import { Text, Heading, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface UpdateItem {
  title: string;
  description: string;
  emoji?: string;
}

export interface MultipleUpdatesAnnouncementProps {
  managerName: string;
  managerEmail: string;
  updates: UpdateItem[];
  customIntro?: string;
  ctaText?: string;
  ctaUrl?: string;
  unsubscribeToken?: string;
}

/**
 * Email d'annonce de plusieurs nouvelles fonctionnalités
 *
 * Envoyé lors du lancement de plusieurs features pour :
 * - Informer les gestionnaires des nouveautés
 * - Lister toutes les améliorations récentes
 * - Encourager l'adoption
 */
export function MultipleUpdatesAnnouncement({
  managerName,
  managerEmail,
  updates,
  customIntro,
  ctaText = 'Découvrir les nouveautés',
  ctaUrl = 'https://welcomeapp.be/dashboard',
  unsubscribeToken,
}: MultipleUpdatesAnnouncementProps) {
  const updateCount = updates.length;

  return (
    <EmailLayout
      preview={`${updateCount} nouvelle${updateCount > 1 ? 's' : ''} fonctionnalité${updateCount > 1 ? 's' : ''} sur WelcomeApp !`}
      unsubscribeToken={unsubscribeToken}
    >
      {/* Badge "Nouveau" */}
      <Section style={badgeContainer}>
        <Text style={badge}>🎉 {updateCount} NOUVEAUTÉ{updateCount > 1 ? 'S' : ''}</Text>
      </Section>

      {/* En-tête principale */}
      <Heading style={h1}>
        🚀 Les dernières améliorations de WelcomeApp
      </Heading>

      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        {customIntro || `Nous avons travaillé dur pour améliorer votre expérience WelcomeApp. Voici ${updateCount > 1 ? 'les' : 'la'} ${updateCount} dernière${updateCount > 1 ? 's' : ''} fonctionnalité${updateCount > 1 ? 's' : ''} que nous avons ajoutée${updateCount > 1 ? 's' : ''} pour vous !`}
      </Text>

      {/* Liste des updates */}
      <Section style={updatesContainer}>
        {updates.map((update, index) => (
          <Section key={index} style={updateCard}>
            <Text style={updateNumber}>{index + 1}</Text>
            <Section style={updateContent}>
              <Text style={updateTitle}>
                {update.emoji && `${update.emoji} `}{update.title}
              </Text>
              <Text style={updateDescription}>{update.description}</Text>
            </Section>
          </Section>
        ))}
      </Section>

      {/* Call to Action */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href={ctaUrl} variant="primary">
          {ctaText}
        </EmailButton>
      </Section>

      <Hr style={hr} />

      {/* Section : Besoin d'aide */}
      <Section style={helpCard}>
        <Heading style={h2}>💬 Des questions ?</Heading>
        <Text style={helpText}>
          Si vous avez besoin d'aide pour utiliser ces nouvelles fonctionnalités,
          n'hésitez pas à répondre directement à cet email. Nous sommes là pour vous accompagner !
        </Text>
      </Section>

      {/* Section : Roadmap teaser */}
      <Section style={roadmapBox}>
        <Text style={roadmapTitle}>👀 Et ce n'est pas fini...</Text>
        <Text style={roadmapText}>
          D'autres fonctionnalités passionnantes arrivent bientôt pour améliorer
          encore plus votre expérience WelcomeApp. Restez connecté ! 🚀
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
        <strong>P.S.</strong> Partagez ces nouveautés avec vos confrères gestionnaires
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
  fontSize: '28px',
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
  margin: '0 0 12px',
};

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const updatesContainer = {
  marginTop: '32px',
};

const updateCard = {
  display: 'flex',
  gap: '16px',
  marginBottom: '20px',
  padding: '20px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
};

const updateNumber = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  backgroundColor: '#6366f1',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  borderRadius: '50%',
  margin: '0',
  flexShrink: 0,
};

const updateContent = {
  flex: 1,
};

const updateTitle = {
  color: '#1f2937',
  fontSize: '17px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 8px',
};

const updateDescription = {
  color: '#6b7280',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const helpCard = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '20px',
};

const helpText = {
  color: '#1e40af',
  fontSize: '15px',
  lineHeight: '1.6',
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
  margin: '0',
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
