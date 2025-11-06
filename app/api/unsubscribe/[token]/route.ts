import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * API Route : Désabonnement des emails marketing
 *
 * GET /api/unsubscribe/[token]
 *
 * Valide le token et désabonne l'utilisateur des emails marketing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token || token.length !== 32) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lien invalide - WelcomeApp</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6; padding: 20px; }
            .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #ef4444; margin-bottom: 16px; }
            p { color: #6b7280; line-height: 1.6; }
            a { color: #3b82f6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Lien invalide</h1>
            <p>Ce lien de désabonnement est invalide ou a expiré.</p>
            <p>Si vous souhaitez vous désabonner, contactez-nous à <a href="mailto:contact@welcomeapp.be">contact@welcomeapp.be</a></p>
          </div>
        </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Utiliser la fonction SQL pour valider le token et désabonner
    const { data, error } = await supabase.rpc('validate_unsubscribe_token', {
      p_raw_token: token,
    });

    if (error) {
      console.error('[UNSUBSCRIBE] Error validating token:', error);
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Erreur - WelcomeApp</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6; padding: 20px; }
            .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #ef4444; margin-bottom: 16px; }
            p { color: #6b7280; line-height: 1.6; }
            a { color: #3b82f6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Erreur</h1>
            <p>Une erreur est survenue lors du traitement de votre demande.</p>
            <p>Contactez-nous à <a href="mailto:contact@welcomeapp.be">contact@welcomeapp.be</a></p>
          </div>
        </body>
        </html>
        `,
        {
          status: 500,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        }
      );
    }

    // data est un array avec un seul élément contenant { valid, client_id, error_message }
    const result = data && data.length > 0 ? data[0] : null;

    if (!result || !result.valid) {
      const errorMessage =
        result?.error_message || 'Token invalide ou expiré';

      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Impossible de se désabonner - WelcomeApp</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6; padding: 20px; }
            .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #ef4444; margin-bottom: 16px; }
            p { color: #6b7280; line-height: 1.6; }
            .error { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin: 20px 0; }
            a { color: #3b82f6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Impossible de se désabonner</h1>
            <div class="error">
              ${errorMessage}
            </div>
            <p>Si vous souhaitez vous désabonner, contactez-nous à <a href="mailto:contact@welcomeapp.be">contact@welcomeapp.be</a></p>
          </div>
        </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        }
      );
    }

    // Succès : l'utilisateur a été désabonné
    console.log('[UNSUBSCRIBE] User unsubscribed successfully:', result.client_id);

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Désabonnement confirmé - WelcomeApp</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6; padding: 20px; }
          .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
          h1 { color: #10b981; margin-bottom: 16px; font-size: 32px; }
          p { color: #6b7280; line-height: 1.6; margin: 16px 0; }
          .emoji { font-size: 64px; margin-bottom: 20px; }
          .note { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 24px 0; text-align: left; }
          a { color: #3b82f6; text-decoration: none; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="emoji">✅</div>
          <h1>Désabonnement confirmé</h1>
          <p>Vous ne recevrez plus d'emails marketing de notre part.</p>
          <div class="note">
            <strong>Note importante :</strong> Vous continuerez à recevoir les emails essentiels concernant votre compte (confirmations, alertes de sécurité, etc.)
          </div>
          <p style="margin-top: 32px;">
            Vous avez changé d'avis ? <a href="mailto:contact@welcomeapp.be">Contactez-nous</a>
          </p>
          <p style="margin-top: 24px; font-size: 14px; color: #9ca3af;">
            © ${new Date().getFullYear()} WelcomeApp - <a href="https://welcomeapp.be">welcomeapp.be</a>
          </p>
        </div>
      </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  } catch (error) {
    console.error('[UNSUBSCRIBE] Unexpected error:', error);

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erreur - WelcomeApp</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6; padding: 20px; }
          .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          h1 { color: #ef4444; margin-bottom: 16px; }
          p { color: #6b7280; line-height: 1.6; }
          a { color: #3b82f6; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Erreur inattendue</h1>
          <p>Une erreur est survenue lors du traitement de votre demande.</p>
          <p>Contactez-nous à <a href="mailto:contact@welcomeapp.be">contact@welcomeapp.be</a></p>
        </div>
      </body>
      </html>
      `,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }
}
