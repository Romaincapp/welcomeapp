import { Text, Heading, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface AdminAccountDeletedNotificationProps {
  managerName: string;
  managerEmail: string;
  slug: string;
  deletedAt: string;
  welcomebookCount?: number;
}

/**
 * Email de notification admin pour suppression de compte gestionnaire
 *
 * Envoyé automatiquement à contact@welcomeapp.be lorsqu'un gestionnaire
 * supprime son compte pour le suivi et l'analyse.
 */
export function AdminAccountDeletedNotification({
  managerName,
  managerEmail,
  slug,
  deletedAt,
  welcomebookCount = 0,
}: AdminAccountDeletedNotificationProps) {
  const deletedAtDate = new Date(deletedAt);
  const formattedDate = deletedAtDate.toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  const dashboardUrl = `https://welcomeapp.be/admin/managers`;

  return (
    <EmailLayout preview={`Compte supprimé : ${managerName}`}>
      {/* En-tête principale */}
      <Heading style={h1}>Compte gestionnaire supprimé ⚠️</Heading>

      <Text style={paragraph}>
        Un gestionnaire vient de supprimer son compte sur la plateforme WelcomeApp.
      </Text>

      {/* Section : Informations gestionnaire */}
      <Section style={card}>
        <Heading style={h2}>👤 Informations du gestionnaire supprimé</Heading>

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
          <Text style={infoLabel}>Slug :</Text>
          <Text style={infoValue}>{slug}</Text>
        </Section>

        <Section style={infoRow}>
          <Text style={infoLabel}>Date de suppression :</Text>
          <Text style={infoValue}>{formattedDate}</Text>
        </Section>

        {welcomebookCount > 0 && (
          <Section style={infoRow}>
            <Text style={infoLabel}>Nombre de welcomebooks supprimés :</Text>
            <Text style={infoValue}>{welcomebookCount}</Text>
          </Section>
        )}
      </Section>

      {/* Call to Action */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href={dashboardUrl} variant="primary">
          👥 Accéder au Dashboard Admin
        </EmailButton>
      </Section>

      {/* Closing */}
      <Text style={paragraph}>
        <strong>Données supprimées :</strong>
        <br />• Tous les welcomebooks du gestionnaire
        <br />• Tous les tips et médias associés
        <br />• Les analytics events
        <br />• Les sections sécurisées
        <br />• Les designs QR code
      </Text>

      <Text style={paragraph}>
        Cette action est définitive et toutes les données ont été supprimées de la base de données.
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
  backgroundColor: '#fef2f2',
  border: '1px solid #fca5a5',
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

const emailLink = {
  color: '#dc2626',
  textDecoration: 'none',
  fontWeight: '500',
};
