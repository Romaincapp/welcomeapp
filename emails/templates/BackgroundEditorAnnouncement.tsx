import { Text, Heading, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface BackgroundEditorAnnouncementProps {
  managerName: string;
  managerEmail: string;
  unsubscribeToken?: string;
}

/**
 * Email d'annonce de l'éditeur d'arrière-plans amélioré
 *
 * Envoyé pour informer les gestionnaires de la nouvelle interface
 * de gestion des arrière-plans avec crop, galerie et effets Instagram
 */
export function BackgroundEditorAnnouncement({
  managerName,
  managerEmail,
  unsubscribeToken,
}: BackgroundEditorAnnouncementProps) {
  return (
    <EmailLayout
      preview="Nouvelle interface pour vos arrière-plans : crop, galerie et effets Instagram !"
      unsubscribeToken={unsubscribeToken}
    >
      {/* Badge "Nouveau" */}
      <Section style={badgeContainer}>
        <Text style={badge}>🎉 NOUVEAU</Text>
      </Section>

      {/* En-tête principale */}
      <Heading style={h1}>
        🎨 Personnalisez vos arrière-plans comme un pro
      </Heading>

      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        Nous sommes ravis de vous présenter la refonte complète de l'éditeur d'arrière-plans !
        Fini les compromis : créez des fonds personnalisés parfaits en quelques clics.
      </Text>

      {/* Section : Description de la feature */}
      <Section style={featureCard}>
        <Text style={featureCardTitle}>🚀 Qu'est-ce qui change ?</Text>
        <Text style={featureCardText}>
          Votre éditeur d'arrière-plans dispose maintenant d'outils professionnels inspirés d'Instagram :
          recadrage interactif, galerie de fonds prédéfinis, filtres visuels en temps réel, et compression
          automatique pour des temps de chargement optimaux.
        </Text>
      </Section>

      {/* Section : Les 3 nouveautés principales */}
      <Section style={{ marginTop: '32px' }}>
        <Heading style={h2}>✨ Les 3 nouveautés phares :</Heading>

        {/* Feature 1 */}
        <Section style={featureBox}>
          <Text style={featureNumber}>1.</Text>
          <Section>
            <Text style={featureTitle}>✂️ Recadrage Intelligent</Text>
            <Text style={featureDescription}>
              Recadrez vos images avant upload avec 6 ratios prédéfinis (16:9 paysage, 9:16 smartphone, 1:1 carré...).
              Ajustez le cadrage en temps réel, puis laissez la compression automatique optimiser le poids (~70% de réduction !).
            </Text>
          </Section>
        </Section>

        {/* Feature 2 */}
        <Section style={featureBox}>
          <Text style={featureNumber}>2.</Text>
          <Section>
            <Text style={featureTitle}>🖼️ Galerie de Fonds Professionnels</Text>
            <Text style={featureDescription}>
              Pas de photo sous la main ? Choisissez parmi 8 arrière-plans professionnels prêts à l'emploi
              (plage, montagne, forêt, lac...). Zéro upload requis, économie de stockage garantie.
            </Text>
          </Section>
        </Section>

        {/* Feature 3 */}
        <Section style={featureBox}>
          <Text style={featureNumber}>3.</Text>
          <Section>
            <Text style={featureTitle}>🎬 Effets Instagram-Style</Text>
            <Text style={featureDescription}>
              Appliquez des filtres visuels en un swipe : Normal, Sombre, Lumineux ou Flou.
              Carousel horizontal avec preview en temps réel, exactement comme sur Instagram Stories.
            </Text>
          </Section>
        </Section>
      </Section>

      {/* Section : Bénéfices */}
      <Section style={{ marginTop: '32px' }}>
        <Heading style={h2}>💎 Pourquoi c'est génial pour vous :</Heading>

        <Section style={benefitBox}>
          <Text style={benefitIcon}>✓</Text>
          <Text style={benefitText}>
            <strong>Gain de temps :</strong> Recadrez et appliquez des effets en 30 secondes chrono
          </Text>
        </Section>

        <Section style={benefitBox}>
          <Text style={benefitIcon}>✓</Text>
          <Text style={benefitText}>
            <strong>Économie de stockage :</strong> Compression auto ~70% + fonds prédéfinis sans upload
          </Text>
        </Section>

        <Section style={benefitBox}>
          <Text style={benefitIcon}>✓</Text>
          <Text style={benefitText}>
            <strong>Rendu professionnel :</strong> Contrôle précis du cadrage mobile avec drag & drop
          </Text>
        </Section>

        <Section style={benefitBox}>
          <Text style={benefitIcon}>✓</Text>
          <Text style={benefitText}>
            <strong>Zéro compétence design :</strong> Interface intuitive, résultat pro garanti
          </Text>
        </Section>
      </Section>

      {/* Call to Action */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href="https://welcomeapp.be/dashboard" variant="primary">
          Essayer maintenant
        </EmailButton>
      </Section>

      <Hr style={hr} />

      {/* Section : Comment ça marche */}
      <Section style={howToCard}>
        <Heading style={h2}>🎯 Comment l'utiliser ?</Heading>

        <Text style={stepText}>
          <strong>Étape 1 :</strong> Connectez-vous à votre dashboard
        </Text>
        <Text style={stepText}>
          <strong>Étape 2 :</strong> Cliquez sur "Éditer" (bouton header ou footer)
        </Text>
        <Text style={stepText}>
          <strong>Étape 3 :</strong> Onglet "Arrière-plan" → Choisissez "Upload Custom" ou "Galerie Prédéfinie"
        </Text>
        <Text style={stepText}>
          <strong>Étape 4 :</strong> Si upload → Recadrez avec ratios → Sélectionnez un effet → Ajustez position mobile
        </Text>
        <Text style={stepText}>
          <strong>Étape 5 :</strong> Cliquez "Enregistrer" → Votre fond est optimisé et appliqué !
        </Text>
      </Section>

      {/* Section : Astuces Pro */}
      <Section style={tipsBox}>
        <Text style={tipsTitle}>💡 Astuces Pro</Text>

        <Text style={tipText}>
          <strong>• Ratio 16:9</strong> : Parfait pour les paysages de vacances (plage, montagne)
        </Text>
        <Text style={tipText}>
          <strong>• Effet "Sombre"</strong> : Améliore le contraste du texte blanc sur photos claires
        </Text>
        <Text style={tipText}>
          <strong>• Galerie prédéfinie</strong> : Utilisez "Plage" ou "Montagne" si votre photo est floue
        </Text>
        <Text style={tipText}>
          <strong>• Position mobile</strong> : Cliquez directement dans le téléphone pour ajuster le point focal
        </Text>
      </Section>

      {/* Section : Feedback */}
      <Section style={feedbackBox}>
        <Text style={feedbackText}>
          <strong>💬 Votre avis compte !</strong>
          <br />
          <br />
          Testez cette nouvelle interface et partagez-nous vos impressions.
          Répondez à cet email avec vos retours, suggestions ou questions.
          <br />
          <br />
          Nous lisons tous vos messages et améliorons WelcomeApp grâce à vos idées ! 🚀
        </Text>
      </Section>

      {/* Section : Roadmap teaser */}
      <Section style={roadmapBox}>
        <Text style={roadmapTitle}>👀 En préparation...</Text>
        <Text style={roadmapText}>
          Prochainement : encore plus de templates visuels, bibliothèque d'icônes,
          et intégration d'IA pour suggérer automatiquement les meilleurs réglages.
        </Text>
        <Text style={roadmapText}>
          Restez connecté pour ne rien manquer ! 🎉
        </Text>
      </Section>

      {/* Closing */}
      <Text style={paragraph}>
        Bonne création,
        <br />
        L'équipe WelcomeApp
      </Text>

      {/* P.S. */}
      <Text style={psText}>
        <strong>P.S.</strong> Cette mise à jour est 100% gratuite et disponible immédiatement.
        Aucune configuration requise, connectez-vous et c'est parti ! 🎨
      </Text>
    </EmailLayout>
  );
}

// Styles (hérités du template FeatureAnnouncement)
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

const featureBox = {
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
  marginBottom: '20px',
  paddingBottom: '20px',
  borderBottom: '1px solid #e5e7eb',
};

const featureNumber = {
  display: 'inline-block',
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '700',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  textAlign: 'center' as const,
  lineHeight: '36px',
  margin: '0',
  flexShrink: 0,
};

const featureTitle = {
  color: '#1f2937',
  fontSize: '17px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const featureDescription = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.6',
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

const tipsBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '24px',
};

const tipsTitle = {
  color: '#166534',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const tipText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0 0 8px',
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
