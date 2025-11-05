import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialiser Resend
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * ⚠️ ROUTE DE TEST TEMPORAIRE - À SUPPRIMER EN PRODUCTION ⚠️
 *
 * GET /api/admin/test-email
 *
 * Envoie un email de test simple sans authentification
 * pour valider que Resend fonctionne correctement.
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[TEST EMAIL] Envoi d\'un email de test...');

    // Email simple HTML
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Email - WelcomeApp</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #4F46E5; margin: 0;">🧪 Test Email WelcomeApp</h1>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0; color: #065f46; font-weight: 600;">✅ Succès !</p>
      <p style="margin: 8px 0 0 0; color: #047857; font-size: 14px;">
        Si vous recevez cet email, cela signifie que votre configuration Resend fonctionne parfaitement !
      </p>
    </div>

    <h2 style="color: #1f2937; font-size: 20px; margin-top: 30px;">Informations de test :</h2>
    <ul style="color: #4b5563; line-height: 1.8;">
      <li><strong>Service :</strong> Resend</li>
      <li><strong>DNS configuré :</strong> ✅ Oui (via Vercel)</li>
      <li><strong>Envoi via :</strong> API Route Next.js</li>
      <li><strong>Date :</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Brussels' })}</li>
    </ul>

    <div style="text-align: center; margin-top: 40px;">
      <a href="https://welcomeapp.be/admin"
         style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Accéder au Dashboard Admin
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;" />

    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0; line-height: 1.6;">
      © ${new Date().getFullYear()} WelcomeApp. Tous droits réservés.
      <br />
      <span style="color: #ef4444;">⚠️ Ceci est un email de test. Ne pas répondre.</span>
    </p>
  </div>
</body>
</html>
    `.trim();

    // Envoyer l'email
    const result = await resend.emails.send({
      from: 'WelcomeApp <noreply@welcomeapp.be>',
      to: 'romainfrancedumoulin@gmail.com', // Hard-coded admin email
      subject: '🧪 Test Email - Configuration Resend OK !',
      html: htmlContent,
    });

    console.log('[TEST EMAIL] Email envoyé avec succès !');
    console.log('[TEST EMAIL] Resend ID:', result.data?.id);

    return NextResponse.json({
      success: true,
      message: 'Email de test envoyé avec succès !',
      emailId: result.data?.id,
      recipient: 'romainfrancedumoulin@gmail.com',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[TEST EMAIL] Erreur:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
