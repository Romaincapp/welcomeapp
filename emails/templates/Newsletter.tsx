import { Text, Heading, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface NewsletterProps {
  managerName: string;
  managerEmail: string;
  month: string; // ex: "Novembre 2025"
  platformStats: {
    totalManagers: number;
    totalTips: number;
    totalViews: number;
  };
  topFeatures?: Array<{
    name: string;
    description: string;
    emoji: string;
  }>;
  tips?: Array<{
    title: string;
    content: string;
  }>;
  communityHighlight?: {
    managerName: string;
    achievement: string;
  };
  unsubscribeToken?: string;
}

/**
 * Newsletter mensuelle WelcomeApp
 *
 * Envoyée chaque mois pour :
 * - Partager les statistiques de la plateforme
 * - Présenter les fonctionnalités populaires
 * - Donner des conseils d'utilisation
 * - Mettre en avant la communauté
 */
export function Newsletter({
  managerName,
  managerEmail,
  month,
  platformStats,
  topFeatures = [],
  tips = [],
  communityHighlight,
  unsubscribeToken,
}: NewsletterProps) {
  return (
    <EmailLayout
      preview={`Newsletter WelcomeApp - ${month}`}
      unsubscribeToken={unsubscribeToken}
    >
      {/* En-tête */}
      <Section style={headerBox}>
        <Text style={headerLabel}>📰 NEWSLETTER</Text>
        <Heading style={h1}>WelcomeApp - {month}</Heading>
        <Text style={headerSubtitle}>
          Votre recap mensuel : stats, nouveautés et conseils
        </Text>
      </Section>

      {/* Salutation */}
      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        Bienvenue dans votre newsletter mensuelle ! Découvrez ce qui s'est passé
        sur WelcomeApp ce mois-ci et comment tirer le meilleur parti de la plateforme.
      </Text>

      <Hr style={hr} />

      {/* Section : Stats plateforme */}
      <Section>
        <Heading style={h2}>📊 La plateforme en chiffres</Heading>
        <Section style={statsGrid}>
          <Section style={statCard}>
            <Text style={statNumber}>{platformStats.totalManagers}</Text>
            <Text style={statLabel}>Gestionnaires actifs</Text>
          </Section>
          <Section style={statCard}>
            <Text style={statNumber}>{platformStats.totalTips}</Text>
            <Text style={statLabel}>Conseils publiés</Text>
          </Section>
          <Section style={statCard}>
            <Text style={statNumber}>{platformStats.totalViews}</Text>
            <Text style={statLabel}>Vues ce mois</Text>
          </Section>
        </Section>
        <Text style={statsCaption}>
          🎉 Merci à vous tous pour cette croissance incroyable !
        </Text>
      </Section>

      <Hr style={hr} />

      {/* Section : Top fonctionnalités */}
      {topFeatures.length > 0 && (
        <>
          <Section>
            <Heading style={h2}>🔥 Les fonctionnalités les plus utilisées</Heading>
            {topFeatures.map((feature, index) => (
              <Section key={index} style={featureBox}>
                <Text style={featureEmoji}>{feature.emoji}</Text>
                <Section>
                  <Text style={featureTitle}>
                    {index + 1}. {feature.name}
                  </Text>
                  <Text style={featureText}>{feature.description}</Text>
                </Section>
              </Section>
            ))}
          </Section>
          <Hr style={hr} />
        </>
      )}

      {/* Section : Conseils du mois */}
      {tips.length > 0 && (
        <>
          <Section>
            <Heading style={h2}>💡 Conseils d'utilisation du mois</Heading>
            {tips.map((tip, index) => (
              <Section key={index} style={tipBox}>
                <Text style={tipNumber}>#{index + 1}</Text>
                <Section>
                  <Text style={tipTitle}>{tip.title}</Text>
                  <Text style={tipContent}>{tip.content}</Text>
                </Section>
              </Section>
            ))}
          </Section>
          <Hr style={hr} />
        </>
      )}

      {/* Section : Community Highlight */}
      {communityHighlight && (
        <>
          <Section style={communityBox}>
            <Heading style={h2}>⭐ Coup de projecteur communauté</Heading>
            <Text style={communityText}>
              Ce mois-ci, nous mettons en avant{' '}
              <strong>{communityHighlight.managerName}</strong> qui a{' '}
              {communityHighlight.achievement} !
            </Text>
            <Text style={communityText}>
              👏 Bravo et merci de contribuer à créer des expériences exceptionnelles
              pour les voyageurs !
            </Text>
          </Section>
          <Hr style={hr} />
        </>
      )}

      {/* Section : Call to Action */}
      <Section style={ctaBox}>
        <Heading style={h2}>🚀 Prêt à passer au niveau supérieur ?</Heading>
        <Text style={ctaText}>
          Profitez de ces insights pour améliorer votre WelcomeBook et offrir
          la meilleure expérience possible à vos voyageurs.
        </Text>
        <Section style={{ textAlign: 'center' as const, marginTop: '20px' }}>
          <EmailButton
            href="https://welcomeapp.be/dashboard?utm_source=newsletter"
            variant="primary"
          >
            Optimiser mon WelcomeBook
          </EmailButton>
        </Section>
      </Section>

      {/* Section : Footer social */}
      <Section style={socialBox}>
        <Text style={socialText}>
          <strong>Restez connecté !</strong>
          <br />
          Rejoignez notre communauté pour échanger des astuces, partager vos
          expériences et rester informé des dernières nouveautés.
        </Text>
      </Section>

      {/* Closing */}
      <Text style={paragraph}>
        À très bientôt,
        <br />
        L'équipe WelcomeApp
      </Text>

      {/* P.S. */}
      <Text style={psText}>
        <strong>P.S.</strong> Cette newsletter vous plaît ? Partagez-la avec
        d'autres gestionnaires de locations ! Plus nous sommes nombreux, plus
        nous pouvons améliorer l'expérience des voyageurs. 🌍
      </Text>
    </EmailLayout>
  );
}

// Styles
const headerBox = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const headerLabel = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '1.2',
  margin: '0 0 12px',
};

const headerSubtitle = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0',
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

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const statsGrid = {
  display: 'flex',
  gap: '16px',
  justifyContent: 'space-between',
  marginBottom: '20px',
};

const statCard = {
  flex: '1',
  backgroundColor: '#f0f9ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
};

const statNumber = {
  color: '#1e40af',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 6px',
};

const statLabel = {
  color: '#3b82f6',
  fontSize: '13px',
  fontWeight: '500',
  margin: '0',
};

const statsCaption = {
  color: '#10b981',
  fontSize: '14px',
  fontWeight: '500',
  textAlign: 'center' as const,
  margin: '0',
};

const featureBox = {
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const featureEmoji = {
  fontSize: '28px',
  lineHeight: '1',
  margin: '0',
  flexShrink: 0,
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
  margin: '0',
};

const tipBox = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  marginBottom: '16px',
};

const tipNumber = {
  backgroundColor: '#fbbf24',
  color: '#78350f',
  fontSize: '14px',
  fontWeight: '700',
  padding: '4px 10px',
  borderRadius: '12px',
  margin: '0',
  flexShrink: 0,
};

const tipTitle = {
  color: '#1f2937',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 6px',
};

const tipContent = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};

const communityBox = {
  backgroundColor: '#faf5ff',
  border: '2px solid #c084fc',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
};

const communityText = {
  color: '#6b21a8',
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '0 0 12px',
};

const ctaBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
};

const ctaText = {
  color: '#166534',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
};

const socialBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #93c5fd',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '24px',
  textAlign: 'center' as const,
};

const socialText = {
  color: '#1e40af',
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
