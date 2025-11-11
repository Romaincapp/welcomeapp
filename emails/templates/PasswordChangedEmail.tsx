import { Text, Heading, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface PasswordChangedEmailProps {
  managerName: string;
  managerEmail: string;
}

/**
 * Email de confirmation après changement de mot de passe
 *
 * Envoyé automatiquement après la réinitialisation du mot de passe pour :
 * - Confirmer le changement
 * - Alerter en cas de modification non autorisée
 * - Fournir des instructions de sécurité
 */
export function PasswordChangedEmail({
  managerName,
  managerEmail,
}: PasswordChangedEmailProps) {
  const dashboardUrl = 'https://welcomeapp.be/dashboard';
  const contactEmail = 'contact@welcomeapp.be';
  const forgotPasswordUrl = 'https://welcomeapp.be/forgot-password';

  return (
    <EmailLayout
      preview={`Votre mot de passe WelcomeApp a été modifié`}
      // Pas d'unsubscribeToken : email transactionnel (sécurité)
    >
      {/* En-tête principale */}
      <Heading style={h1}>Mot de passe modifié ✓</Heading>

      <Text style={paragraph}>
        Bonjour <strong>{managerName}</strong>,
      </Text>

      <Text style={paragraph}>
        Nous vous confirmons que le mot de passe de votre compte WelcomeApp a été modifié avec succès.
      </Text>

      {/* Section : Détails du changement */}
      <Section style={infoCard}>
        <Heading style={h2}>📋 Informations de sécurité</Heading>
        <Text style={infoText}>
          <strong>Compte :</strong> {managerEmail}
          <br />
          <strong>Date :</strong> {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </Section>

      {/* Call to Action */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href={dashboardUrl} variant="primary">
          🔐 Accéder à mon compte
        </EmailButton>
      </Section>

      <Hr style={hr} />

      {/* Section : Alerte sécurité */}
      <Section style={warningCard}>
        <Heading style={warningTitle}>⚠️ Vous n'êtes pas à l'origine de cette modification ?</Heading>
        <Text style={warningText}>
          Si vous n'avez <strong>PAS</strong> demandé cette modification, votre compte pourrait être compromis.
        </Text>
        <Text style={warningText}>
          <strong>Actions à entreprendre immédiatement :</strong>
        </Text>
        <Text style={bulletPoint}>
          1. Réinitialisez votre mot de passe via{' '}
          <a href={forgotPasswordUrl} style={link}>
            ce lien sécurisé
          </a>
        </Text>
        <Text style={bulletPoint}>
          2. Contactez-nous immédiatement à{' '}
          <a href={`mailto:${contactEmail}`} style={link}>
            {contactEmail}
          </a>
        </Text>
        <Text style={bulletPoint}>
          3. Vérifiez qu'aucune modification suspecte n'a été effectuée sur votre WelcomeBook
        </Text>
      </Section>

      {/* Section : Conseils de sécurité */}
      <Section style={{ marginTop: '32px' }}>
        <Heading style={h2}>🔒 Conseils de sécurité</Heading>

        <Text style={bulletPoint}>
          ✓ Utilisez un mot de passe <strong>unique</strong> pour WelcomeApp (différent de vos autres comptes)
        </Text>
        <Text style={bulletPoint}>
          ✓ Choisissez un mot de passe <strong>fort</strong> : minimum 12 caractères, mélange de lettres, chiffres et symboles
        </Text>
        <Text style={bulletPoint}>
          ✓ Ne partagez <strong>jamais</strong> votre mot de passe avec qui que ce soit
        </Text>
        <Text style={bulletPoint}>
          ✓ Méfiez-vous des emails frauduleux : nous ne vous demanderons jamais votre mot de passe par email
        </Text>
      </Section>

      <Hr style={hr} />

      {/* Section : Besoin d'aide */}
      <Section style={helpBox}>
        <Text style={helpText}>
          <strong>💬 Questions ou préoccupations ?</strong>
          <br />
          Notre équipe est disponible 7j/7 pour vous assister. Contactez-nous à{' '}
          <a href={`mailto:${contactEmail}`} style={link}>
            {contactEmail}
          </a>
        </Text>
      </Section>

      {/* Closing */}
      <Text style={paragraph}>
        À bientôt,
        <br />
        L'équipe WelcomeApp
      </Text>

      {/* Footer supplémentaire */}
      <Text style={footerNote}>
        Cet email de sécurité est automatique et ne peut pas être désactivé. Il garantit la protection de votre compte.
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

const infoCard = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '24px',
};

const infoText = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0',
};

const warningCard = {
  backgroundColor: '#fef2f2',
  border: '2px solid #fca5a5',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '24px',
};

const warningTitle = {
  color: '#dc2626',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const warningText = {
  color: '#991b1b',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const bulletPoint = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '0 0 8px',
};

const link = {
  color: '#4F46E5',
  textDecoration: 'underline',
  fontWeight: '500',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const helpBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '24px',
};

const helpText = {
  color: '#14532d',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};

const footerNote = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '32px 0 0',
  textAlign: 'center' as const,
  fontStyle: 'italic',
};
