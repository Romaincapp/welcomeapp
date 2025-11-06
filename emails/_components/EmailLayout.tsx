import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Hr,
  Link,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  preview?: string;
  children: React.ReactNode;
  unsubscribeToken?: string; // Token sécurisé pour le lien de désabonnement
}

/**
 * Layout de base pour tous les emails WelcomeApp
 *
 * Inclut :
 * - Header avec logo
 * - Container responsive
 * - Footer avec liens légaux + unsubscribe
 */
export function EmailLayout({
  preview,
  children,
  unsubscribeToken,
}: EmailLayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Html lang="fr">
      <Head />
      {preview && <Text style={previewText}>{preview}</Text>}
      <Body style={main}>
        <Container style={container}>
          {/* Header avec logo */}
          <Section style={header}>
            <Img
              src="https://welcomeapp.be/logo.png"
              width="150"
              height="auto"
              alt="WelcomeApp"
              style={logo}
            />
          </Section>

          {/* Contenu principal */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              © {currentYear} WelcomeApp. Tous droits réservés.
            </Text>
            <Text style={footerText}>
              WelcomeApp - La plateforme de guides personnalisés pour
              locations de vacances.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://welcomeapp.be" style={link}>
                Site web
              </Link>
              {' • '}
              <Link href="https://welcomeapp.be/privacy" style={link}>
                Politique de confidentialité
              </Link>
              {' • '}
              <Link href="https://welcomeapp.be/terms" style={link}>
                CGU
              </Link>
            </Text>
            {unsubscribeToken && (
              <Text style={unsubscribeText}>
                Vous recevez cet email car vous avez un compte WelcomeApp.
                <br />
                <Link
                  href={`https://welcomeapp.be/api/unsubscribe/${unsubscribeToken}`}
                  style={unsubscribeLink}
                >
                  Se désinscrire des emails marketing
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles inline (requis pour compatibilité email clients)
const previewText = {
  display: 'none',
  overflow: 'hidden',
  lineHeight: '1px',
  opacity: 0,
  maxHeight: 0,
  maxWidth: 0,
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '20px 40px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '0 40px 40px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const footer = {
  padding: '0 40px 40px',
};

const footerText = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#6b7280',
  margin: '4px 0',
  textAlign: 'center' as const,
};

const footerLinks = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#6b7280',
  margin: '12px 0',
  textAlign: 'center' as const,
};

const link = {
  color: '#4F46E5',
  textDecoration: 'none',
};

const unsubscribeText = {
  fontSize: '11px',
  lineHeight: '14px',
  color: '#9ca3af',
  margin: '16px 0 0',
  textAlign: 'center' as const,
};

const unsubscribeLink = {
  color: '#6b7280',
  textDecoration: 'underline',
};
