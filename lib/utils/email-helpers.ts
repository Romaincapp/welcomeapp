/**
 * Helper functions pour générer des URLs de composition d'email
 */

/**
 * Génère une URL pour composer un email dans Gmail web
 * @param to - Adresse email du destinataire
 * @param subject - Sujet de l'email
 * @param body - Corps de l'email
 * @returns URL Gmail compose formatée
 */
export function generateGmailComposeUrl(
  to: string,
  subject: string,
  body: string
): string {
  const params = new URLSearchParams({
    view: 'cm',
    to,
    su: subject,
    body,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Génère le template d'email pour contacter un gestionnaire
 * @param managerName - Nom du gestionnaire
 * @param slug - Slug du welcomebook
 * @returns Objet avec subject et body formatés
 */
export function generateManagerContactTemplate(
  managerName: string | null,
  slug: string
): { subject: string; body: string } {
  const name = managerName || 'Gestionnaire';
  const welcomeBookUrl = `https://welcomeapp.vercel.app/${slug}`;

  const subject = `Contact depuis WelcomeApp - ${name}`;

  const body = `Bonjour ${name},

Slug de votre carnet : ${slug}
Lien vers votre WelcomeBook : ${welcomeBookUrl}

---
Cordialement,
L'équipe WelcomeApp
https://welcomeapp.vercel.app`;

  return { subject, body };
}
