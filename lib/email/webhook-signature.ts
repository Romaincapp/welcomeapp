import crypto from 'crypto';

/**
 * Vérifie la signature HMAC d'un webhook Resend
 *
 * Resend utilise Svix pour signer les webhooks avec HMAC-SHA256.
 * La signature est envoyée dans le header 'svix-signature' au format:
 * "v1,timestamp=TIMESTAMP,signature=SIGNATURE"
 *
 * @param payload - Le body brut du webhook (string)
 * @param signature - Le header 'svix-signature'
 * @param secret - Le webhook secret (RESEND_WEBHOOK_SECRET)
 * @returns true si la signature est valide, false sinon
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    console.error('[verifyWebhookSignature] Signature header manquant');
    return false;
  }

  if (!secret) {
    console.error('[verifyWebhookSignature] RESEND_WEBHOOK_SECRET non configuré');
    return false;
  }

  try {
    // Parser le header svix-signature
    // Format: "v1,timestamp=1234567890,signature=abc123..."
    const parts = signature.split(',');
    const signatureMap: Record<string, string> = {};

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key && value) {
        signatureMap[key.trim()] = value.trim();
      }
    }

    const timestamp = signatureMap['timestamp'];
    const receivedSignature = signatureMap['signature'];

    if (!timestamp || !receivedSignature) {
      console.error('[verifyWebhookSignature] Timestamp ou signature manquant dans le header');
      return false;
    }

    // Vérifier que le timestamp n'est pas trop ancien (tolérance 5 minutes)
    const currentTime = Math.floor(Date.now() / 1000);
    const timestampNum = parseInt(timestamp, 10);
    const timeDiff = Math.abs(currentTime - timestampNum);

    if (timeDiff > 300) {
      // 300 secondes = 5 minutes
      console.error(
        `[verifyWebhookSignature] Timestamp trop ancien (${timeDiff}s de différence)`
      );
      return false;
    }

    // Construire la string signée: "timestamp.payload"
    const signedPayload = `${timestamp}.${payload}`;

    // Calculer le HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('base64');

    // Comparer les signatures de manière sécurisée (timing-safe)
    const receivedBuffer = Buffer.from(receivedSignature, 'base64');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64');

    if (receivedBuffer.length !== expectedBuffer.length) {
      console.error('[verifyWebhookSignature] Longueur des signatures différente');
      return false;
    }

    // Utiliser timingSafeEqual pour éviter les timing attacks
    const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

    if (!isValid) {
      console.error('[verifyWebhookSignature] Signature invalide');
    }

    return isValid;
  } catch (error) {
    console.error('[verifyWebhookSignature] Erreur lors de la vérification:', error);
    return false;
  }
}

/**
 * Type pour les événements webhook Resend
 */
export type ResendWebhookEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked';

/**
 * Interface pour le payload d'un webhook Resend
 */
export interface ResendWebhookPayload {
  type: ResendWebhookEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Champs additionnels selon le type d'événement
    click?: {
      link: string;
      timestamp: string;
      ip_address?: string;
      user_agent?: string;
    };
    bounce?: {
      bounce_type: 'hard' | 'soft';
      reason: string;
    };
    complaint?: {
      feedback_type: string;
      user_agent?: string;
    };
  };
}

/**
 * Convertit le type d'événement Resend en type pour email_events
 */
export function mapResendEventType(resendType: ResendWebhookEventType): string {
  const mapping: Record<ResendWebhookEventType, string> = {
    'email.sent': 'sent',
    'email.delivered': 'delivered',
    'email.delivery_delayed': 'delivery_delayed',
    'email.complained': 'complained',
    'email.bounced': 'bounced',
    'email.opened': 'opened',
    'email.clicked': 'clicked',
  };

  return mapping[resendType] || resendType;
}
