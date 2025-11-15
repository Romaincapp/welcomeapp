import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | WelcomeApp',
  description: 'Politique de confidentialité et protection des données personnelles de WelcomeApp',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-block mb-6 text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-gray-600">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              WelcomeApp s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité
              décrit comment nous collectons, utilisons et protégeons vos données personnelles conformément au
              Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Responsable du traitement</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              <strong>WelcomeApp</strong>
            </p>
            <p className="text-gray-700 leading-relaxed">
              Email de contact : <a href="mailto:contact@welcomeapp.be" className="text-indigo-600 hover:underline">contact@welcomeapp.be</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Données collectées</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous collectons les données suivantes lorsque vous utilisez WelcomeApp :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Données d'identification</strong> : nom, adresse email</li>
              <li><strong>Données de connexion</strong> : adresse IP, type de navigateur, pages visitées</li>
              <li><strong>Données de contenu</strong> : conseils (tips), catégories, images, localisation</li>
              <li><strong>Données analytiques</strong> : nombre de vues, clics, partages, installations PWA</li>
              <li><strong>Cookies</strong> : cookies de session pour l'authentification</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Finalités du traitement</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Créer et gérer votre compte utilisateur</li>
              <li>Fournir les services de WelcomeApp (création de guides, partage, analytics)</li>
              <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
              <li>Vous envoyer des emails transactionnels (confirmation d'inscription, réinitialisation mot de passe)</li>
              <li>Vous envoyer des emails marketing (newsletters, annonces de fonctionnalités) avec votre consentement</li>
              <li>Assurer la sécurité et prévenir la fraude</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Base légale</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous traitons vos données sur les bases légales suivantes :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Exécution du contrat</strong> : pour fournir les services WelcomeApp</li>
              <li><strong>Consentement</strong> : pour l'envoi d'emails marketing (vous pouvez vous désinscrire à tout moment)</li>
              <li><strong>Intérêt légitime</strong> : pour améliorer nos services et assurer la sécurité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Partage des données</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vos données peuvent être partagées avec :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Supabase</strong> : hébergement de la base de données et authentification</li>
              <li><strong>Vercel</strong> : hébergement de l'application</li>
              <li><strong>Resend</strong> : envoi d'emails transactionnels et marketing</li>
              <li><strong>Google Places API</strong> : génération automatique de conseils (Smart Fill)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Aucune donnée n'est vendue à des tiers.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Durée de conservation</h2>
            <p className="text-gray-700 leading-relaxed">
              Vos données sont conservées tant que votre compte est actif. Si vous supprimez votre compte,
              vos données personnelles sont supprimées sous 30 jours. Les données analytiques agrégées et
              anonymisées peuvent être conservées pour améliorer nos services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Vos droits (RGPD)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement</strong> : supprimer vos données ("droit à l'oubli")</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
              <li><strong>Droit de limitation</strong> : demander la limitation du traitement</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Pour exercer vos droits, contactez-nous à{' '}
              <a href="mailto:contact@welcomeapp.be" className="text-indigo-600 hover:underline">
                contact@welcomeapp.be
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Sécurité</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées
              pour protéger vos données contre tout accès non autorisé, perte ou altération. Cela inclut
              le chiffrement des données en transit (HTTPS), l'authentification sécurisée, et des sauvegardes
              régulières.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              WelcomeApp utilise des cookies essentiels pour l'authentification et le fonctionnement du service.
              Aucun cookie publicitaire ou de tracking tiers n'est utilisé. Vous pouvez gérer vos préférences de
              cookies dans les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Emails marketing</h2>
            <p className="text-gray-700 leading-relaxed">
              Vous pouvez vous désinscrire des emails marketing à tout moment en cliquant sur le lien
              "Se désinscrire" présent dans chaque email. Les emails transactionnels (confirmation d'inscription,
              réinitialisation de mot de passe) ne peuvent pas être désactivés car ils sont nécessaires au
              fonctionnement du service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Modifications</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
              Les modifications seront publiées sur cette page avec une date de mise à jour actualisée.
              Nous vous encourageons à consulter régulièrement cette page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles,
              contactez-nous :
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Email :{' '}
              <a href="mailto:contact@welcomeapp.be" className="text-indigo-600 hover:underline">
                contact@welcomeapp.be
              </a>
            </p>
          </section>

          <section className="border-t pt-8">
            <p className="text-sm text-gray-500 text-center">
              WelcomeApp respecte votre vie privée et s'engage à protéger vos données personnelles
              conformément au RGPD et à la législation belge en vigueur.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8 space-x-4">
          <Link href="/" className="text-indigo-600 hover:underline">
            Accueil
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/terms" className="text-indigo-600 hover:underline">
            Conditions Générales d'Utilisation
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/login" className="text-indigo-600 hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
