import { Text, Heading, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface InactiveReactivationProps {
  managerName: string;
  managerEmail: string;
  slug: string;
  daysSinceLastLogin: number;
  totalTips?: number;
  totalViews?: number;
}

/**
 * Email de réactivation pour gestionnaires inactifs
 *
 * Envoyé automatiquement après X jours d'inactivité pour :
 * - Rappeler l'existence du WelcomeBook
 * - Présenter les nouvelles fonctionnalités
 * - Encourager à revenir
 */
export function InactiveReactivation({
  managerName,
  managerEmail,
  slug,
  daysSinceLastLogin,
  totalTips = 0,
  totalViews = 0,
}: InactiveReactivationProps) {
  const welcomebookUrl = `https://welcomeapp.be/${slug}?utm_source=email&utm_campaign=reactivation`;
  const dashboardUrl = `https://welcomeapp.be/dashboard?utm_source=email&utm_campaign=reactivation`;

  // Message personnalisé selon le nombre de jours
  const getPersonalizedMessage = () => {
    if (daysSinceLastLogin < 45) {
      return 'Ça fait un moment que nous ne vous avons pas vu !';
    } else if (daysSinceLastLogin < 90) {
      return 'Nous espérons que tout va bien pour vous.';
    } else {
      return 'Vous nous avez manqué !';
    }
  };

  return (
    <EmailLayout
      preview={`${getPersonalizedMessage()} Découvrez les nouveautés WelcomeApp`}
      unsubscribeEmail={managerEmail}
    >
      {/* En-tête principale */}
      <Heading style={h1}>{getPersonalizedMessage()} 👋</Heading>

      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        Nous avons remarqué que vous n'avez pas visité votre WelcomeApp depuis{' '}
        <strong>{daysSinceLastLogin} jours</strong>. Nous espérons que tout va bien !
      </Text>

      {/* Stats section (si disponibles) */}
      {(totalTips > 0 || totalViews > 0) && (
        <Section style={statsCard}>
          <Heading style={h2}>📊 Pendant votre absence...</Heading>
          <Section style={statsGrid}>
            {totalViews > 0 && (
              <Section style={statBox}>
                <Text style={statNumber}>{totalViews}</Text>
                <Text style={statLabel}>vues de votre WelcomeBook</Text>
              </Section>
            )}
            {totalTips > 0 && (
              <Section style={statBox}>
                <Text style={statNumber}>{totalTips}</Text>
                <Text style={statLabel}>conseils publiés</Text>
              </Section>
            )}
          </Section>
          <Text style={statsText}>
            Vos voyageurs continuent d'utiliser votre guide ! 🎉
          </Text>
        </Section>
      )}

      {/* Section : Nouveautés */}
      <Section style={{ marginTop: '32px' }}>
        <Heading style={h2}>✨ Découvrez nos nouvelles fonctionnalités</Heading>

        <Section style={featureCard}>
          <Text style={featureEmoji}>🎨</Text>
          <Section>
            <Text style={featureTitle}>QR Code Designer A4</Text>
            <Text style={featureText}>
              Créez des QR codes personnalisés avec votre branding et imprimez-les
              en format A4 pour afficher dans votre location !
            </Text>
          </Section>
        </Section>

        <Section style={featureCard}>
          <Text style={featureEmoji}>📈</Text>
          <Section>
            <Text style={featureTitle}>Dashboard Analytics Avancé</Text>
            <Text style={featureText}>
              Suivez l'évolution de vos tips, analysez les catégories les plus populaires,
              et comprenez l'engagement de vos voyageurs.
            </Text>
          </Section>
        </Section>

        <Section style={featureCard}>
          <Text style={featureEmoji}>🤖</Text>
          <Section>
            <Text style={featureTitle}>Smart Fill Amélioré</Text>
            <Text style={featureText}>
              Notre IA génère maintenant des conseils encore plus pertinents et personnalisés
              basés sur votre localisation et vos préférences.
            </Text>
          </Section>
        </Section>
      </Section>

      {/* Call to Action */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href={dashboardUrl} variant="primary">
          Reprendre là où je me suis arrêté
        </EmailButton>
      </Section>

      <Hr style={hr} />

      {/* Section : Motivation */}
      <Section style={motivationBox}>
        <Text style={motivationTitle}>💡 Le saviez-vous ?</Text>
        <Text style={motivationText}>
          Les gestionnaires qui mettent à jour régulièrement leur WelcomeBook reçoivent
          en moyenne <strong>3x plus d'engagement</strong> de la part de leurs voyageurs.
        </Text>
        <Text style={motivationText}>
          Prenez 5 minutes aujourd'hui pour :
        </Text>
        <Text style={bulletPoint}>✓ Ajouter 1-2 nouveaux conseils</Text>
        <Text style={bulletPoint}>✓ Mettre à jour vos informations pratiques</Text>
        <Text style={bulletPoint}>✓ Vérifier que tout est à jour</Text>
      </Section>

      {/* Section : Aide */}
      <Section style={helpBox}>
        <Text style={helpText}>
          <strong>🤝 Besoin d'un coup de main ?</strong>
          <br />
          Notre équipe est toujours là pour vous aider. Répondez à cet email et
          nous vous accompagnerons pour optimiser votre WelcomeBook !
        </Text>
      </Section>

      {/* Closing */}
      <Text style={paragraph}>
        Au plaisir de vous revoir bientôt,
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

const statsCard = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  padding: '24px',
  marginTop: '24px',
  textAlign: 'center' as const,
};

const statsGrid = {
  display: 'flex',
  gap: '16px',
  justifyContent: 'center',
  marginBottom: '16px',
};

const statBox = {
  flex: '1',
};

const statNumber = {
  color: '#1e40af',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 4px',
};

const statLabel = {
  color: '#3b82f6',
  fontSize: '13px',
  margin: '0',
};

const statsText = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '500',
  margin: '12px 0 0',
};

const featureCard = {
  display: 'flex',
  gap: '16px',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const featureEmoji = {
  fontSize: '32px',
  lineHeight: '1',
  margin: '0',
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

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const motivationBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '24px',
};

const motivationTitle = {
  color: '#15803d',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const motivationText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const bulletPoint = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0 0 4px 16px',
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
