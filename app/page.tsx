import Link from 'next/link'
import Image from 'next/image'
import BackgroundCarousel from '@/components/BackgroundCarousel'
import StructuredData from '@/components/StructuredData'
import AnimatedText from '@/components/AnimatedText'
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
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all cursor-pointer">
          <Image
            src="/logo-email.png"
            alt="WelcomeApp Logo"
            width={40}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            priority
          />
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="text-center text-white max-w-5xl mx-auto px-4">
          {/* Texte caché pour SEO et accessibilité - Visible pour Google et lecteurs d'écran */}
          <p className="sr-only">
            L'IA prérempli les activités autour de vous en 10 secondes.
            Idéal pour petits et grands gestionnaires.
            Livret d'accueil digital gratuit pour Airbnb, gîtes, villas et locations de vacances.
            Welcomebook numérique professionnel avec guide interactif, carte interactive, recommandations locales et infos pratiques.
            Solution gratuite pour check-in automatisé.
            Créez votre guide personnalisé en quelques minutes sans carte bancaire.
          </p>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-3 sm:mb-4 md:mb-6 drop-shadow-lg">
            WelcomeApp
          </h1>
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 md:mb-12 opacity-90 drop-shadow-md max-w-3xl mx-auto px-2 h-16 sm:h-20 flex items-center justify-center">
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

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-3xl mx-auto">
            <Link
              href="/demo"
              className="w-[70%] sm:w-auto inline-block bg-white text-indigo-600 px-5 py-2.5 sm:px-10 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Démo
            </Link>
            <Link
              href="/login"
              className="w-[70%] sm:w-auto inline-block bg-transparent border-2 border-white text-white px-5 py-2.5 sm:px-10 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-white hover:text-indigo-600 transition"
            >
              Gérer
            </Link>
            <Link
              href="/signup"
              className="w-[70%] sm:w-auto inline-block bg-indigo-700 text-white px-5 py-2.5 sm:px-10 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-800 transition shadow-lg"
            >
              Créer
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
