import { Button } from '@react-email/components';
import * as React from 'react';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

/**
 * Bouton CTA personnalisé pour les emails
 *
 * Variants:
 * - primary: Bouton principal (indigo)
 * - secondary: Bouton secondaire (gris)
 */
export function EmailButton({
  href,
  children,
  variant = 'primary',
}: EmailButtonProps) {
  const buttonStyle =
    variant === 'primary' ? primaryButtonStyle : secondaryButtonStyle;

  return (
    <Button href={href} style={buttonStyle}>
      {children}
    </Button>
  );
}

// Styles
const baseButtonStyle = {
  fontSize: '16px',
  fontWeight: '600',
  borderRadius: '8px',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
  textAlign: 'center' as const,
  width: 'auto',
  margin: '16px 0',
};

const primaryButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#4F46E5',
  color: '#ffffff',
};

const secondaryButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#f3f4f6',
  color: '#1f2937',
  border: '1px solid #e5e7eb',
};
