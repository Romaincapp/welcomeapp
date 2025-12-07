import { Text, Heading, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface OnboardingDay3CustomizeProps {
  managerName: string;
  managerEmail: string;
  slug: string;
  unsubscribeToken?: string;
}

/**
 * Email J+3 : Personnalisation du WelcomeBook
 * Guide pour personnaliser couleurs, logo et arrière-plan
 */
export function OnboardingDay3Customize({
  managerName,
  managerEmail,
  slug,
  unsubscribeToken,
}: OnboardingDay3CustomizeProps) {
  const welcomebookUrl = `https://welcomeapp.be/${slug}`;

  return (
    <EmailLayout
      preview={`${managerName}, personnalisez votre WelcomeBook !`}
      unsubscribeToken={unsubscribeToken}
    >
      <Heading style={h1}>Donnez du style à votre WelcomeBook ! 🎨</Heading>

      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        Votre WelcomeBook fonctionne déjà très bien, mais saviez-vous que vous pouvez
        le personnaliser entièrement pour qu'il reflète l'identité de votre location ?
      </Text>

      {/* Section principale */}
      <Section style={card}>
        <Heading style={h2}>🖌️ Options de personnalisation</Heading>

        <Section style={featureBox}>
          <Text style={featureTitle}>📸 Arrière-plan</Text>
          <Text style={featureText}>
            Uploadez une photo de votre propriété ou choisissez parmi notre galerie
            (plage, montagne, forêt...). Recadrez-la comme vous voulez !
          </Text>
        </Section>

        <Section style={featureBox}>
          <Text style={featureTitle}>🎨 Couleurs</Text>
          <Text style={featureText}>
            Choisissez la couleur du header et du footer pour matcher votre déco
            ou votre charte graphique.
          </Text>
        </Section>

        <Section style={featureBox}>
          <Text style={featureTitle}>✏️ Textes</Text>
          <Text style={featureText}>
            Personnalisez le titre et le sous-titre du header avec un message
            de bienvenue unique pour vos voyageurs.
          </Text>
        </Section>

        <Section style={featureBox}>
          <Text style={featureTitle}>🌟 Effets visuels</Text>
          <Text style={featureText}>
            Ajoutez un effet sur l'arrière-plan : normal, sombre, lumineux ou flou
            pour mettre en valeur votre contenu.
          </Text>
        </Section>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <Text style={ctaText}>
          Cliquez sur le menu <strong>+</strong> puis <strong>"Personnaliser"</strong>
        </Text>
        <EmailButton href={welcomebookUrl} variant="primary">
          🎨 Personnaliser maintenant
        </EmailButton>
      </Section>

      <Hr style={hr} />

      {/* Inspiration */}
      <Section style={inspirationBox}>
        <Text style={inspirationTitle}>💡 Idées qui fonctionnent bien :</Text>
        <Text style={inspirationText}>
          • Une belle photo de votre terrasse ou vue<br />
          • Les couleurs de votre région (bleu mer, vert forêt...)<br />
          • Un message chaleureux type "Bienvenue chez nous !"
        </Text>
      </Section>

      <Text style={paragraph}>
        Demain, on vous montrera comment partager votre WelcomeBook avec vos voyageurs !
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
  backgroundColor: '#fdf4ff',
  border: '1px solid #e879f9',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
};

const featureBox = {
  marginBottom: '20px',
};

const featureTitle = {
  color: '#86198f',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 6px',
};

const featureText = {
  color: '#701a75',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 0 24px',
};

const ctaText = {
  color: '#6b7280',
  fontSize: '14px',
  marginBottom: '16px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const inspirationBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const inspirationTitle = {
  color: '#1e40af',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const inspirationText = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0',
};
