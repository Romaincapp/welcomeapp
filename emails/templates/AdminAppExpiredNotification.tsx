import { Text, Heading, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface AdminAppExpiredNotificationProps {
  managerName: string;
  managerEmail: string;
  slug: string;
  accountStatus: 'grace_period' | 'suspended';
  suspendedAt?: string;
  creditsBalance: number;
  lastCreditConsumption?: string;
}

/**
 * Email de notification admin pour expiration app (crédits épuisés)
 *
 * Envoyé automatiquement à contact@welcomeapp.be lorsqu'une app
 * arrive à expiration due au manque de crédits.
 */
export function AdminAppExpiredNotification({
  managerName,
  managerEmail,
  slug,
  accountStatus,
  suspendedAt,
  creditsBalance,
  lastCreditConsumption,
}: AdminAppExpiredNotificationProps) {
  const welcomebookUrl = `https://welcomeapp.be/${slug}`;
  const dashboardUrl = `https://welcomeapp.be/admin/managers`;
  const managerDashboardUrl = `https://welcomeapp.be/admin/managers/${slug}`;

  const isGracePeriod = accountStatus === 'grace_period';
  const isSuspended = accountStatus === 'suspended';

  const statusLabel = isGracePeriod
    ? 'Période de grâce (7 jours)'
    : 'Compte suspendu';

  const statusColor = isGracePeriod ? '#f59e0b' : '#dc2626';
  const statusBg = isGracePeriod ? '#fef3c7' : '#fee2e2';
  const statusBorder = isGracePeriod ? '#fbbf24' : '#fca5a5';

  let formattedSuspendedAt = '';
  if (suspendedAt) {
    const suspendedDate = new Date(suspendedAt);
    formattedSuspendedAt = suspendedDate.toLocaleString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  }

  let formattedLastConsumption = '';
  if (lastCreditConsumption) {
    const lastDate = new Date(lastCreditConsumption);
    formattedLastConsumption = lastDate.toLocaleString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  }

  return (
    <EmailLayout preview={`App expirée : ${managerName} (${statusLabel})`}>
      {/* En-tête principale */}
      <Heading style={h1}>
        {isGracePeriod ? '⚠️ App en période de grâce' : '🚫 App suspendue'}
      </Heading>

      <Text style={paragraph}>
        {isGracePeriod
          ? 'Une app vient de passer en période de grâce suite à l\'épuisement de ses crédits.'
          : 'Une app vient d\'être suspendue après 7 jours en période de grâce.'}
      </Text>

      {/* Section : Statut */}
      <Section style={{...card, backgroundColor: statusBg, borderColor: statusBorder}}>
        <Heading style={{...h2, color: statusColor}}>
          📊 Statut de l'app
        </Heading>

        <Section style={statusBadgeContainer}>
          <div style={{...statusBadge, backgroundColor: statusColor}}>
            {statusLabel.toUpperCase()}
          </div>
        </Section>

        <Section style={infoRow}>
          <Text style={infoLabel}>Crédits restants :</Text>
          <Text style={{...infoValue, color: statusColor, fontWeight: '700'}}>
            {creditsBalance} crédit{creditsBalance > 1 ? 's' : ''}
          </Text>
        </Section>

        {suspendedAt && (
          <Section style={infoRow}>
            <Text style={infoLabel}>
              {isGracePeriod ? 'Entré en période de grâce le :' : 'Suspendu le :'}
            </Text>
            <Text style={infoValue}>{formattedSuspendedAt}</Text>
          </Section>
        )}

        {lastCreditConsumption && (
          <Section style={infoRow}>
            <Text style={infoLabel}>Dernière consommation de crédit :</Text>
            <Text style={infoValue}>{formattedLastConsumption}</Text>
          </Section>
        )}
      </Section>

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
      </Section>

      {/* Call to Action */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href={managerDashboardUrl} variant="primary">
          👤 Voir le profil du gestionnaire
        </EmailButton>

        <Text style={ctaSeparator}>ou</Text>

        <EmailButton href={dashboardUrl} variant="secondary">
          👥 Accéder au Dashboard Admin
        </EmailButton>
      </Section>

      {/* Informations supplémentaires */}
      <Text style={paragraph}>
        <strong>{isGracePeriod ? 'Période de grâce :' : 'Compte suspendu :'}</strong>
        <br />
        {isGracePeriod ? (
          <>
            • Le gestionnaire a 7 jours pour recharger ses crédits
            <br />• Après 7 jours, le compte sera automatiquement suspendu
            <br />• Le gestionnaire a été notifié par email
          </>
        ) : (
          <>
            • L'app est maintenant inactive
            <br />• Le gestionnaire ne peut plus accéder au dashboard
            <br />• Les données sont conservées mais le compte est suspendu
            <br />• Le gestionnaire peut réactiver son compte en rechargeant ses crédits
          </>
        )}
      </Text>

      {isGracePeriod && (
        <Text style={{...paragraph, color: '#f59e0b', fontWeight: '600'}}>
          ⏰ Action requise dans les 7 prochains jours pour éviter la suspension.
        </Text>
      )}
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
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
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

const statusBadgeContainer = {
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const statusBadge = {
  display: 'inline-block',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  padding: '8px 16px',
  borderRadius: '6px',
  letterSpacing: '0.5px',
};
