import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation | WelcomeApp',
  description: 'Conditions générales d\'utilisation de WelcomeApp',
};

export default function TermsPage() {
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
            Conditions Générales d'Utilisation
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptation des conditions</h2>
            <p className="text-gray-700 leading-relaxed">
              En accédant et en utilisant WelcomeApp ("le Service"), vous acceptez d'être lié par les présentes
              Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces conditions, veuillez ne pas
              utiliser le Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description du service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              WelcomeApp est une plateforme permettant aux gestionnaires de locations de vacances de créer
              des guides personnalisés (WelcomeBooks) pour leurs voyageurs. Le Service inclut :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Création et gestion de conseils (tips) avec texte, images, vidéos et localisation</li>
              <li>Personnalisation du design (header, couleurs, logo)</li>
              <li>Génération automatique de conseils par IA (Smart Fill)</li>
              <li>Traduction automatique multilingue</li>
              <li>Analytics et statistiques de consultation</li>
              <li>QR Code personnalisé pour impression</li>
              <li>Application Web Progressive (PWA) installable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Inscription et compte utilisateur</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">3.1 Création de compte</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pour utiliser WelcomeApp, vous devez créer un compte en fournissant une adresse email valide et
              un mot de passe sécurisé. Vous êtes responsable de la confidentialité de vos identifiants.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">3.2 Exactitude des informations</h3>
            <p className="text-gray-700 leading-relaxed">
              Vous vous engagez à fournir des informations exactes et à les maintenir à jour. Toute fausse
              information peut entraîner la suspension ou la suppression de votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Utilisation du service</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">4.1 Utilisation acceptable</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vous vous engagez à utiliser le Service uniquement à des fins légales et conformément à ces CGU.
              Il est interdit de :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Publier du contenu illégal, offensant, diffamatoire ou portant atteinte aux droits d'autrui</li>
              <li>Utiliser le Service pour du spam, du phishing ou toute activité malveillante</li>
              <li>Tenter d'accéder de manière non autorisée au système ou aux données d'autres utilisateurs</li>
              <li>Copier, modifier ou distribuer le code source de WelcomeApp sans autorisation</li>
              <li>Utiliser des bots ou scripts automatisés sans autorisation</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">4.2 Contenu utilisateur</h3>
            <p className="text-gray-700 leading-relaxed">
              Vous conservez tous les droits sur le contenu que vous publiez (conseils, images, vidéos).
              En publiant du contenu sur WelcomeApp, vous nous accordez une licence mondiale, non exclusive,
              pour afficher, héberger et distribuer ce contenu dans le cadre du Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Propriété intellectuelle</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              WelcomeApp et tous ses éléments (code source, design, logo, marque) sont la propriété exclusive
              de WelcomeApp et sont protégés par les lois sur la propriété intellectuelle.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Les contenus générés par l'IA (Smart Fill) sont fournis à titre informatif et peuvent être modifiés
              librement par l'utilisateur. WelcomeApp ne garantit pas l'exactitude de ces contenus.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Modération et suppression de contenu</h2>
            <p className="text-gray-700 leading-relaxed">
              WelcomeApp se réserve le droit de modérer, suspendre ou supprimer tout contenu ou compte
              utilisateur qui violerait ces CGU, sans préavis et sans obligation de justification. Nous nous
              efforçons d'assurer un environnement sûr et respectueux pour tous les utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Tarification et paiement</h2>
            <p className="text-gray-700 leading-relaxed">
              WelcomeApp est actuellement gratuit pour tous les utilisateurs. Nous nous réservons le droit
              d'introduire des fonctionnalités payantes à l'avenir, avec un préavis de 30 jours minimum.
              Les utilisateurs existants bénéficieront d'un accès grandfathered aux fonctionnalités actuelles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disponibilité du service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous nous efforçons de maintenir le Service disponible 24/7, mais nous ne garantissons pas
              une disponibilité ininterrompue. Des interruptions peuvent survenir pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Maintenance planifiée (notifiée à l'avance)</li>
              <li>Problèmes techniques imprévus</li>
              <li>Cas de force majeure</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Nous ne pouvons être tenus responsables des dommages résultant d'une indisponibilité temporaire
              du Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation de responsabilité</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              WelcomeApp est fourni "tel quel", sans garantie d'aucune sorte. Nous ne sommes pas responsables :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>De l'exactitude, de la qualité ou de la légalité du contenu publié par les utilisateurs</li>
              <li>Des dommages directs ou indirects résultant de l'utilisation du Service</li>
              <li>Des erreurs ou inexactitudes dans les contenus générés par IA (Smart Fill)</li>
              <li>De la perte de données (nous recommandons des sauvegardes régulières)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Résiliation</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">10.1 Par l'utilisateur</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vous pouvez supprimer votre compte à tout moment depuis les paramètres. La suppression est
              irréversible et entraîne la suppression définitive de toutes vos données sous 30 jours.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">10.2 Par WelcomeApp</h3>
            <p className="text-gray-700 leading-relaxed">
              Nous pouvons suspendre ou supprimer votre compte en cas de violation des CGU, d'activité
              frauduleuse ou illégale, sans préavis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Protection des données</h2>
            <p className="text-gray-700 leading-relaxed">
              L'utilisation de vos données personnelles est régie par notre{' '}
              <Link href="/privacy" className="text-indigo-600 hover:underline">
                Politique de Confidentialité
              </Link>
              , qui fait partie intégrante de ces CGU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Modifications des CGU</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications seront
              publiées sur cette page avec une date de mise à jour actualisée. L'utilisation continue
              du Service après modification vaut acceptation des nouvelles CGU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Services tiers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              WelcomeApp utilise des services tiers pour fournir certaines fonctionnalités :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Supabase</strong> : authentification et base de données</li>
              <li><strong>Google Places API</strong> : génération automatique de conseils</li>
              <li><strong>Resend</strong> : envoi d'emails</li>
              <li><strong>Vercel</strong> : hébergement</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Ces services ont leurs propres conditions d'utilisation. WelcomeApp n'est pas responsable
              des actions ou politiques de ces services tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Droit applicable et juridiction</h2>
            <p className="text-gray-700 leading-relaxed">
              Ces CGU sont régies par le droit belge. Tout litige relatif à l'utilisation du Service sera
              soumis à la juridiction exclusive des tribunaux de Belgique.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question concernant ces CGU, contactez-nous :
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
              En utilisant WelcomeApp, vous reconnaissez avoir lu, compris et accepté les présentes
              Conditions Générales d'Utilisation.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8 space-x-4">
          <Link href="/" className="text-indigo-600 hover:underline">
            Accueil
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/privacy" className="text-indigo-600 hover:underline">
            Politique de Confidentialité
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
