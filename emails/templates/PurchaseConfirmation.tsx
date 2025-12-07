import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface PurchaseConfirmationProps {
  userName?: string
  packageName: string
  creditsAmount: number
  amountPaid: string
  newBalance: number
  purchaseDate: string
}

export default function PurchaseConfirmation({
  userName = 'there',
  packageName,
  creditsAmount,
  amountPaid,
  newBalance,
  purchaseDate,
}: PurchaseConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Merci pour votre achat de ${creditsAmount} crédits WelcomeApp!`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://welcomeapp.be/logo.png"
            width="150"
            height="40"
            alt="WelcomeApp"
            style={logo}
          />

          <Section style={heroSection}>
            <Text style={checkIcon}>✅</Text>
            <Heading style={heading}>Paiement confirmé!</Heading>
          </Section>

          <Text style={paragraph}>Bonjour {userName},</Text>

          <Text style={paragraph}>
            Merci pour votre achat! Vos crédits ont été ajoutés à votre compte.
          </Text>

          <Section style={receiptBox}>
            <Text style={receiptTitle}>Récapitulatif</Text>

            <table style={receiptTable}>
              <tr>
                <td style={receiptLabel}>Pack</td>
                <td style={receiptValue}>{packageName}</td>
              </tr>
              <tr>
                <td style={receiptLabel}>Crédits ajoutés</td>
                <td style={receiptValueHighlight}>+{creditsAmount} crédits</td>
              </tr>
              <tr>
                <td style={receiptLabel}>Montant payé</td>
                <td style={receiptValue}>{amountPaid}</td>
              </tr>
              <tr>
                <td style={receiptLabel}>Date</td>
                <td style={receiptValue}>{purchaseDate}</td>
              </tr>
              <tr style={receiptTotalRow}>
                <td style={receiptLabel}>Nouveau solde</td>
                <td style={receiptTotal}>{newBalance} crédits</td>
              </tr>
            </table>
          </Section>

          <Text style={paragraph}>
            Votre welcomebook continuera à fonctionner sans interruption.
            Vous pouvez suivre votre consommation de crédits à tout moment dans votre dashboard.
          </Text>

          <Section style={buttonContainer}>
            <Link href="https://welcomeapp.be/dashboard/credits" style={button}>
              Voir mes crédits
            </Link>
          </Section>

          <Text style={paragraph}>
            Un reçu détaillé est également disponible dans votre{' '}
            <Link href="https://welcomeapp.be/dashboard/billing" style={link}>
              historique des achats
            </Link>.
          </Text>

          <Text style={footer}>
            Merci de votre confiance!
            <br />
            L&apos;équipe WelcomeApp
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
}

const logo = {
  margin: '0 auto 30px',
  display: 'block',
}

const heroSection = {
  textAlign: 'center' as const,
  marginBottom: '30px',
}

const checkIcon = {
  fontSize: '48px',
  margin: '0 0 10px 0',
}

const heading = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const receiptBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #e2e8f0',
}

const receiptTitle = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 16px 0',
}

const receiptTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const receiptLabel = {
  color: '#64748b',
  fontSize: '14px',
  padding: '8px 0',
  textAlign: 'left' as const,
}

const receiptValue = {
  color: '#1a1a1a',
  fontSize: '14px',
  padding: '8px 0',
  textAlign: 'right' as const,
  fontWeight: '500',
}

const receiptValueHighlight = {
  color: '#16a34a',
  fontSize: '14px',
  padding: '8px 0',
  textAlign: 'right' as const,
  fontWeight: '600',
}

const receiptTotalRow = {
  borderTop: '1px solid #e2e8f0',
}

const receiptTotal = {
  color: '#4f46e5',
  fontSize: '18px',
  padding: '12px 0 0 0',
  textAlign: 'right' as const,
  fontWeight: '700',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  display: 'inline-block',
}

const link = {
  color: '#4f46e5',
  textDecoration: 'underline',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
  textAlign: 'center' as const,
}
