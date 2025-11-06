import { Text, Heading, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface TipsReminderProps {
  managerName: string;
  managerEmail: string;
  slug: string;
  currentTipsCount: number;
  daysSinceCreation: number;
  suggestedCategories?: string[];
  unsubscribeToken?: string;
}

/**
 * Email de rappel pour ajouter des conseils
 *
 * Envoyé automatiquement si le gestionnaire a peu de tips (<3)
 * après X jours pour :
 * - Encourager à enrichir le WelcomeBook
 * - Donner des idées de catégories
 * - Expliquer les bénéfices
 */
export function TipsReminder({
  managerName,
  managerEmail,
  slug,
  currentTipsCount,
  daysSinceCreation,
  suggestedCategories = [
    'Restaurants',
    'Activités',
    'Transports',
    'Infos pratiques',
    'Lieux secrets',
  ],
  unsubscribeToken,
}: TipsReminderProps) {
  const dashboardUrl = `https://welcomeapp.be/dashboard?utm_source=email&utm_campaign=tips_reminder`;

  // Message personnalisé selon le nombre de tips
  const getEncouragementMessage = () => {
    if (currentTipsCount === 0) {
      return "Vous n'avez pas encore ajouté de conseils";
    } else if (currentTipsCount === 1) {
      return 'Vous avez ajouté 1 conseil';
    } else {
      return `Vous avez ajouté ${currentTipsCount} conseils`;
    }
  };

  return (
    <EmailLayout
      preview="Enrichissez votre WelcomeBook avec vos meilleurs conseils"
      unsubscribeToken={unsubscribeToken}
    >
      {/* En-tête principale */}
      <Heading style={h1}>Vos voyageurs attendent vos conseils ! ✨</Heading>

      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        Nous avons remarqué que votre WelcomeBook est encore un peu vide.{' '}
        {getEncouragementMessage()} depuis sa création il y a {daysSinceCreation}{' '}
        jours.
      </Text>

      {/* Section : Pourquoi c'est important */}
      <Section style={whyBox}>
        <Heading style={h2}>🎯 Pourquoi ajouter des conseils ?</Heading>
        <Text style={whyText}>
          Un WelcomeBook bien rempli transforme complètement l'expérience de vos
          voyageurs :
        </Text>
        <Section style={benefitList}>
          <Text style={benefitItem}>
            ✓ <strong>Meilleure expérience</strong> - Vos voyageurs découvrent les
            pépites locales
          </Text>
          <Text style={benefitItem}>
            ✓ <strong>Moins de questions</strong> - Toutes les infos au même endroit
          </Text>
          <Text style={benefitItem}>
            ✓ <strong>Avis 5 étoiles</strong> - Les voyageurs apprécient l'attention
            portée aux détails
          </Text>
          <Text style={benefitItem}>
            ✓ <strong>Gain de temps</strong> - Vos conseils sont disponibles 24/7
          </Text>
        </Section>
      </Section>

      {/* Section : Objectif 10 tips */}
      <Section style={goalBox}>
        <Text style={goalTitle}>🎯 Votre objectif</Text>
        <Section style={progressBar}>
          <Section
            style={{
              ...progressFill,
              width: `${Math.min((currentTipsCount / 10) * 100, 100)}%`,
            }}
          />
        </Section>
        <Text style={goalText}>
          {currentTipsCount} / 10 conseils
        </Text>
        <Text style={goalSubtext}>
          {10 - currentTipsCount > 0
            ? `Plus que ${10 - currentTipsCount} conseils pour atteindre l'objectif !`
            : 'Objectif atteint ! Continuez sur votre lancée 🎉'}
        </Text>
      </Section>

      <Hr style={hr} />

      {/* Section : Idées de catégories */}
      <Section>
        <Heading style={h2}>💡 Par où commencer ?</Heading>
        <Text style={paragraph}>
          Voici quelques catégories populaires pour inspirer vos premiers conseils :
        </Text>

        {suggestedCategories.map((category, index) => (
          <Section key={index} style={categoryCard}>
            <Text style={categoryEmoji}>
              {['🍽️', '🎉', '🚗', 'ℹ️', '🗺️'][index % 5]}
            </Text>
            <Section>
              <Text style={categoryTitle}>{category}</Text>
              <Text style={categoryExample}>
                {index === 0 && 'Ex: Votre restaurant italien préféré à 10 min'}
                {index === 1 && 'Ex: Le meilleur spot pour admirer le coucher de soleil'}
                {index === 2 && 'Ex: Application de taxi locale, horaires de bus'}
                {index === 3 && 'Ex: Codes WiFi, règles du voisinage, tri des déchets'}
                {index === 4 && 'Ex: La plage secrète des locaux, le marché du dimanche'}
              </Text>
            </Section>
          </Section>
        ))}
      </Section>

      {/* Call to Action */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href={dashboardUrl} variant="primary">
          Ajouter mes premiers conseils
        </EmailButton>
      </Section>

      <Hr style={hr} />

      {/* Section : Smart Fill */}
      <Section style={smartFillBox}>
        <Heading style={h2}>🤖 Pas d'inspiration ? Utilisez Smart Fill !</Heading>
        <Text style={smartFillText}>
          Notre IA peut générer automatiquement des conseils personnalisés basés
          sur votre localisation. Gagnez du temps et obtenez des suggestions
          pertinentes en quelques secondes !
        </Text>
        <Text style={smartFillText}>
          Rendez-vous dans votre dashboard → Cliquez sur "Smart Fill" → Laissez
          la magie opérer ✨
        </Text>
      </Section>

      {/* Section : Témoignage */}
      <Section style={testimonialBox}>
        <Text style={testimonialQuote}>
          "Depuis que j'ai ajouté mes conseils locaux, mes voyageurs me remercient
          systématiquement dans leurs avis. Certains reviennent même spécialement
          pour découvrir mes nouvelles recommandations !"
        </Text>
        <Text style={testimonialAuthor}>
          — Marie, gestionnaire depuis 2 ans
        </Text>
      </Section>

      {/* Closing */}
      <Text style={paragraph}>
        Prenez 10 minutes aujourd'hui pour enrichir votre WelcomeBook. Vos futurs
        voyageurs vous en seront reconnaissants ! 🙏
      </Text>

      <Text style={paragraph}>
        À très bientôt,
        <br />
        L'équipe WelcomeApp
      </Text>

      {/* P.S. */}
      <Text style={psText}>
        <strong>P.S.</strong> Besoin d'aide pour structurer vos conseils ? Répondez
        à cet email et nous vous accompagnerons personnellement !
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

const whyBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
};

const whyText = {
  color: '#1e40af',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const benefitList = {
  marginTop: '12px',
};

const benefitItem = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0 0 8px',
};

const goalBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '12px',
  padding: '24px',
  marginTop: '24px',
  textAlign: 'center' as const,
};

const goalTitle = {
  color: '#78350f',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const progressBar = {
  width: '100%',
  height: '24px',
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: '12px',
  overflow: 'hidden',
  margin: '0 auto 12px',
  maxWidth: '300px',
};

const progressFill = {
  height: '100%',
  backgroundColor: '#f59e0b',
  transition: 'width 0.3s ease',
};

const goalText = {
  color: '#92400e',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 6px',
};

const goalSubtext = {
  color: '#78350f',
  fontSize: '14px',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const categoryCard = {
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const categoryEmoji = {
  fontSize: '28px',
  lineHeight: '1',
  margin: '0',
  flexShrink: 0,
};

const categoryTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 6px',
};

const categoryExample = {
  color: '#6b7280',
  fontSize: '13px',
  fontStyle: 'italic',
  lineHeight: '1.5',
  margin: '0',
};

const smartFillBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '8px',
  padding: '20px',
};

const smartFillText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '1.7',
  margin: '0 0 12px',
};

const testimonialBox = {
  backgroundColor: '#faf5ff',
  borderLeft: '4px solid #a855f7',
  borderRadius: '4px',
  padding: '20px',
  marginTop: '24px',
};

const testimonialQuote = {
  color: '#6b21a8',
  fontSize: '15px',
  fontStyle: 'italic',
  lineHeight: '1.7',
  margin: '0 0 12px',
};

const testimonialAuthor = {
  color: '#7c3aed',
  fontSize: '14px',
  fontWeight: '600',
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
