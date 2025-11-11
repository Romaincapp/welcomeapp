import { Text, Heading, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface AdminNewWelcomebookNotificationProps {
  managerName: string;
  managerEmail: string;
  slug: string;
  createdAt: string;
}

/**
 * Email de notification admin pour nouveaux welcomebooks
 *
 * Envoyé automatiquement à contact@welcomeapp.be après chaque inscription
 * pour suivre les nouveaux clients et leur welcomebook.
 */
export function AdminNewWelcomebookNotification({
  managerName,
  managerEmail,
  slug,
  createdAt,
}: AdminNewWelcomebookNotificationProps) {
  const welcomebookUrl = `https://welcomeapp.be/${slug}`;
  const dashboardUrl = `https://welcomeapp.be/admin/managers`;
  const createdAtDate = new Date(createdAt);
  const formattedDate = createdAtDate.toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <EmailLayout preview={`Nouveau WelcomeBook créé : ${managerName}`}>
      {/* En-tête principale */}
      <Heading style={h1}>Nouveau WelcomeBook créé ! 🎉</Heading>

      <Text style={paragraph}>
        Un nouveau gestionnaire vient de créer son WelcomeBook sur la plateforme.
      </Text>

      {/* Section : Informations gestionnaire */}
      <Section style={card}>
        <Heading style={h2}>👤 Informations du gestionnaire</Heading>

        <Section style={infoRow}>
          <Text style={infoLabel}>Nom de la propriété :</Text>
          <Text style={infoValue}>{managerName}</Text>
        </Section>

        <Section style={infoRow}>
          <Text style={infoLabel}>Email :</Text>
          <Text style={infoValue}>
            <a href={`mailto:${managerEmail}`} style={emailLink}>
              {managerEmail}
            </a>
          </Text>
        </Section>

        <Section style={infoRow}>
          <Text style={infoLabel}>URL du WelcomeBook :</Text>
          <Text style={infoValue}>
            <a href={welcomebookUrl} style={link}>
              {welcomebookUrl}
            </a>
          </Text>
        </Section>

        <Section style={infoRow}>
          <Text style={infoLabel}>Date de création :</Text>
          <Text style={infoValue}>{formattedDate}</Text>
        </Section>
      </Section>

      {/* Call to Action */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href={welcomebookUrl} variant="primary">
          📖 Voir le WelcomeBook
        </EmailButton>

        <Text style={ctaSeparator}>ou</Text>

        <EmailButton href={dashboardUrl} variant="secondary">
          👥 Accéder au Dashboard Modérateur
        </EmailButton>
      </Section>

      {/* Closing */}
      <Text style={paragraph}>
        Ce gestionnaire a reçu un email de bienvenue automatique.
      </Text>

      <Text style={paragraph}>
        <strong>Prochaines étapes recommandées :</strong>
        <br />• Consulter son welcomebook pour voir son activité
        <br />• Le contacter si besoin pour offrir de l'aide
        <br />• Suivre ses premiers pas dans le dashboard admin
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

const infoRow = {
  marginBottom: '12px',
};

const infoLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const infoValue = {
  color: '#1f2937',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 0 8px',
  fontWeight: '500',
};

const link = {
  color: '#4F46E5',
  textDecoration: 'none',
  fontWeight: '500',
};

const emailLink = {
  color: '#059669',
  textDecoration: 'none',
  fontWeight: '500',
};

const ctaSeparator = {
  color: '#9ca3af',
  fontSize: '14px',
  fontWeight: '500',
  margin: '16px 0',
};
