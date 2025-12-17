import Link from 'next/link'
import Image from 'next/image'
import BackgroundCarousel from '@/components/BackgroundCarousel'
import StructuredData from '@/components/StructuredData'
import AnimatedText from '@/components/AnimatedText'
import DeviceMockup from '@/components/DeviceMockup'
import type { Metadata } from 'next'

// SEO optimisé pour B2B ET B2C : conciergeries, promoteurs, gestionnaires, hôtes Airbnb
export const metadata: Metadata = {
  title: 'WelcomeApp - Livret d\'Accueil Digital Gratuit pour Airbnb & Locations de Vacances',
  description: 'Créez votre livret d\'accueil digital gratuit pour Airbnb, gîte, villa, appartement. Welcomebook numérique professionnel : guide interactif, infos pratiques, recommandations locales. Essai gratuit sans carte bancaire.',
  keywords: [
    // B2C - Mots-clés prioritaires "longue traîne"
    'livret d\'accueil digital airbnb gratuit',
    'livret accueil digital gratuit',
    'livret d\'accueil numérique airbnb',
    'welcomebook digital gratuit',
    'guide voyageur digital gratuit',
    'livret accueil airbnb pdf',
    'application livret accueil gratuit',
    // B2C - Airbnb & hôtes indépendants
    'airbnb livret accueil',
    'hôte airbnb outil gratuit',
    'améliorer accueil airbnb',
    'guide location airbnb',
    'check-in airbnb automatique',
    'informations voyageurs airbnb',
    // B2C - Types de locations
    'livret accueil gîte gratuit',
    'livret accueil villa',
    'livret accueil appartement vacances',
    'guide chalet montagne',
    'welcomebook gîte',
    // B2B - Conciergeries
    'logiciel conciergerie location vacances',
    'solution digitale conciergerie',
    'conciergerie airbnb professionnelle',
    'gestion multi-propriétés',
    'outil conciergerie vacation rental',
    'application conciergerie tourisme',
    // B2B - Promoteurs immobiliers
    'welcomebook résidence tourisme',
    'solution digitale promotion immobilière',
    'application accueil résidence',
    'outil marketing immobilier',
    'communication résidentielle digitale',
    'valorisation patrimoine immobilier',
    // Généralistes professionnels
    'welcomebook digital',
    'welcomeapp professionnel',
    'saas gestion voyageurs',
    'plateforme accueil voyageurs',
    'solution white-label location',
    'gestionnaire location vacances',
    'gestion location saisonnière',
    // Niches
    'guide voyageur digital',
    'informations location automatisées',
    'check-in digital',
    'livret accueil numérique',
    'création livret accueil en ligne'
  ],
  authors: [{ name: 'WelcomeApp' }],
  creator: 'WelcomeApp',
  publisher: 'WelcomeApp',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://welcomeapp.be'),
  alternates: {
    canonical: 'https://welcomeapp.be',
  },
  openGraph: {
    title: 'WelcomeApp - Livret d\'Accueil Digital Gratuit pour Airbnb',
    description: 'Créez votre livret d\'accueil digital gratuit pour Airbnb et locations de vacances. Guide interactif, carte, recommandations locales. Essai gratuit, aucune carte bancaire requise.',
    url: 'https://welcomeapp.be',
    siteName: 'WelcomeApp',
    locale: 'fr_BE',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WelcomeApp - Livret d\'Accueil Digital Gratuit pour Airbnb',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WelcomeApp - Livret d\'Accueil Digital Gratuit pour Airbnb',
    description: 'Créez votre livret d\'accueil digital gratuit. Idéal pour Airbnb, gîtes, villas. Guide voyageur interactif avec carte et recommandations.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'rJWsAHQAbi7uweXvhe7ywHw5ZBGRIr4QFUT3dJQ2qKs',
    other: {
      'msvalidate.01': 'A06A157C8581DB838584467E948D8A91',
    },
  },
}

function getBackgroundImages() {
  return [
    '/backgrounds/default-1.jpg',
    '/backgrounds/default-2.jpg',
    '/backgrounds/default-3.jpg',
    '/backgrounds/forêt.jpg',
    '/backgrounds/interieur.jpg',
    '/backgrounds/lac et montagne.jpg',
    '/backgrounds/montagne.jpg',
    '/backgrounds/plage.jpg',
  ]
}

export default function Home() {
  const backgroundImages = getBackgroundImages()

  return (
    <>
      <StructuredData />
      <BackgroundCarousel images={backgroundImages} interval={5000} />

      {/* Logo en haut à gauche - Position réservée pour futur menu */}
      <div className="fixed top-0 left-0 z-50 p-4 sm:p-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg hover:shadow-xl transition-all cursor-pointer">
          <Image
            src="/logo-email.png"
            alt="WelcomeApp Logo"
            width={40}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-full"
            priority
          />
        </div>
      </div>

      <div className="min-h-screen flex flex-col justify-center p-4 sm:p-6 lg:p-8">
        {/* Layout principal responsive */}
        <div className="flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-16 max-w-7xl mx-auto px-4 w-full">

          {/* Contenu texte - Toujours centré sur mobile/tablette, à gauche sur desktop */}
          <div className="text-center xl:text-left text-white w-full max-w-2xl xl:max-w-xl flex-shrink-0">
            {/* Texte caché pour SEO et accessibilité */}
            <p className="sr-only">
              L'IA prérempli les activités autour de vous en 10 secondes.
              Idéal pour petits et grands gestionnaires.
              Livret d'accueil digital gratuit pour Airbnb, gîtes, villas et locations de vacances.
              Welcomebook numérique professionnel avec guide interactif, carte interactive, recommandations locales et infos pratiques.
              Solution gratuite pour check-in automatisé.
              Créez votre guide personnalisé en quelques minutes sans carte bancaire.
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 drop-shadow-lg tracking-tight">
              WelcomeApp
            </h1>

            <div className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 drop-shadow-md mx-auto xl:mx-0 px-2 h-12 sm:h-16 flex items-center justify-center xl:justify-start overflow-hidden">
              <AnimatedText
                texts={[
                  'L\'IA prérempli les activités autour de vous en 10sec',
                  'Idéal pour petits et grands gestionnaires',
                  'Livret d\'accueil digital gratuit pour Airbnb',
                  'Welcomebook numérique professionnel',
                  'Guide interactif pour vos locations',
                  'Solution gratuite pour gîtes et villas',
                  'Check-in automatisé et recommandations',
                  'Créez votre guide en quelques minutes'
                ]}
                typingSpeed={80}
                deletingSpeed={20}
                pauseDuration={1500}
              />
            </div>

            {/* Boutons CTA - Stack vertical sur très petit mobile, horizontal ensuite */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center xl:justify-start items-center w-full">
              <Link
                href="/demo"
                className="w-64 sm:w-auto inline-flex items-center justify-center bg-white text-indigo-600 px-8 py-3 sm:px-10 sm:py-4 rounded-xl text-sm sm:text-base font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                Voir la démo
              </Link>
              <Link
                href="/signup"
                className="w-64 sm:w-auto inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-xl text-sm sm:text-base font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                Créer gratuitement
              </Link>
            </div>

            {/* Lien connexion discret */}
            <div className="mt-4 sm:mt-6">
              <Link
                href="/login"
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Déjà un compte ? Se connecter →
              </Link>
            </div>
          </div>

          {/* Device Mockup avec vidéo de démo */}
          <div className="mt-8 xl:mt-0 flex-shrink-0">
            {/* Version mobile/tablette - Plus petit */}
            <div className="block xl:hidden scale-[0.7] sm:scale-[0.8] md:scale-[0.85] origin-top">
              <DeviceMockup />
            </div>
            {/* Version desktop - Taille normale */}
            <div className="hidden xl:block">
              <DeviceMockup />
            </div>
          </div>
        </div>

        {/* Indicateur de scroll discret sur mobile */}
        <div className="xl:hidden flex justify-center mt-8 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </div>
    </>
  )
}
