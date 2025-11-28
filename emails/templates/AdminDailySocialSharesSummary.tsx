import { Text, Heading, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../_components/EmailLayout';
import { EmailButton } from '../_components/EmailButton';

export interface SocialShareItem {
  user_email: string;
  platform: string;
  credits_awarded: number;
  social_profile_url: string | null;
  shared_at: string;
}

export interface AdminDailySocialSharesSummaryProps {
  shares: SocialShareItem[];
  stats: {
    today: number;
    total_credits: number;
  };
  date: string;
}

/**
 * Email récapitulatif quotidien des partages sociaux pour l'admin
 *
 * Envoyé automatiquement à 9h UTC si des partages ont eu lieu dans les 24h
 */
export function AdminDailySocialSharesSummary({
  shares,
  stats,
  date,
}: AdminDailySocialSharesSummaryProps) {
  const adminUrl = 'https://welcomeapp.be/admin/credits';

  const platformEmojis: Record<string, string> = {
    instagram: '📸',
    linkedin: '🔵',
    facebook: '📘',
    twitter: '🐦',
    blog: '✍️',
    newsletter: '📧',
  };

  return (
    <EmailLayout preview={`${stats.today} partage(s) social - ${stats.total_credits} crédits distribués`}>
      {/* En-tête principale */}
      <Heading style={h1}>Récapitulatif Partages Sociaux 📊</Heading>

      <Text style={paragraph}>
        Voici le récapitulatif des partages sociaux des dernières 24 heures ({date}).
      </Text>

      {/* Stats */}
      <Section style={statsCard}>
        <Section style={statsRow}>
          <Section style={statItem}>
            <Text style={statNumber}>{stats.today}</Text>
            <Text style={statLabel}>partage{stats.today > 1 ? 's' : ''}</Text>
          </Section>
          <Section style={statItem}>
            <Text style={statNumber}>{stats.total_credits}</Text>
            <Text style={statLabel}>crédits distribués</Text>
          </Section>
        </Section>
      </Section>

      {/* Liste des partages */}
      {shares.length > 0 && (
        <Section style={sharesCard}>
          <Heading style={h2}>Détails des partages</Heading>

          {shares.map((share, index) => (
            <Section key={index} style={shareRow}>
              <Text style={shareInfo}>
                <span style={platformBadge}>
                  {platformEmojis[share.platform] || '🔗'} {share.platform}
                </span>
                <br />
                <strong>{share.user_email}</strong> • +{share.credits_awarded} crédits
                <br />
                <span style={shareTime}>
                  {new Date(share.shared_at).toLocaleString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {share.social_profile_url && (
                  <>
                    {' '} • <a href={share.social_profile_url} style={link}>Voir profil</a>
                  </>
                )}
              </Text>
            </Section>
          ))}
        </Section>
      )}

      {/* Call to Action */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <EmailButton href={adminUrl} variant="primary">
          📊 Voir le Dashboard Crédits
        </EmailButton>
      </Section>

      {/* Note */}
      <Text style={note}>
        Cet email est envoyé automatiquement chaque jour à 9h UTC si des partages ont eu lieu.
        <br />
        Système trust-based : les crédits sont attribués immédiatement. Vérifiez occasionnellement
        les profils sociaux pour remercier publiquement les utilisateurs.
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
  fontSize: '18px',
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
  backgroundColor: '#eef2ff',
  border: '1px solid #c7d2fe',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
  marginBottom: '24px',
};

const statsRow = {
  display: 'flex' as const,
  justifyContent: 'center' as const,
  gap: '40px',
};

const statItem = {
  textAlign: 'center' as const,
  display: 'inline-block' as const,
  margin: '0 20px',
};

const statNumber = {
  color: '#4F46E5',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
};

const statLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '4px 0 0',
};

const sharesCard = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
};

const shareRow = {
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '12px',
  marginBottom: '12px',
};

const shareInfo = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};

const platformBadge = {
  backgroundColor: '#dbeafe',
  color: '#1e40af',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: '600',
};

const shareTime = {
  color: '#9ca3af',
  fontSize: '13px',
};

const link = {
  color: '#4F46E5',
  textDecoration: 'none',
  fontWeight: '500',
};

const note = {
  color: '#9ca3af',
  fontSize: '13px',
  lineHeight: '1.5',
  marginTop: '24px',
  fontStyle: 'italic' as const,
};
