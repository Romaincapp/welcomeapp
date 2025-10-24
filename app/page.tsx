import Link from 'next/link'
import BackgroundCarousel from '@/components/BackgroundCarousel'
import { readdirSync } from 'fs'
import { join } from 'path'
import type { Metadata } from 'next'

// SEO optimisé pour attirer les gestionnaires de locations de vacances
export const metadata: Metadata = {
  title: 'WelcomeApp - Welcomebook Digital pour Locations de Vacances | Guide Personnalisé',
  description: 'Créez votre welcomebook digital pour simplifier la gestion et l\'accueil de vos voyageurs. Solution professionnelle pour gestionnaires de locations de vacances, gîtes, chalets et maisons de vacances.',
  keywords: [
    'welcomebook digital',
    'welcomeapp',
    'guide voyageur',
    'location vacances',
    'gestion location saisonnière',
    'accueil voyageur',
    'gestionnaire location vacances',
    'gîte',
    'chalet',
    'maison de vacances',
    'application accueil',
    'guide digital',
    'conseils voyageurs',
    'informations location',
    'service conciergerie'
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
    title: 'WelcomeApp - Welcomebook Digital pour Locations de Vacances',
    description: 'Créez votre welcomebook digital pour simplifier la gestion et l\'accueil de vos voyageurs. Solution professionnelle pour gestionnaires de locations de vacances.',
    url: 'https://welcomeapp.be',
    siteName: 'WelcomeApp',
    locale: 'fr_BE',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg', // On créera cette image plus tard
        width: 1200,
        height: 630,
        alt: 'WelcomeApp - Welcomebook Digital',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WelcomeApp - Welcomebook Digital pour Locations de Vacances',
    description: 'Créez votre welcomebook digital pour simplifier la gestion et l\'accueil de vos voyageurs.',
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
  },
}

function getBackgroundImages() {
  try {
    const imagesDirectory = join(process.cwd(), 'public', 'background-images')
    const filenames = readdirSync(imagesDirectory)
    return filenames
      .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .map(file => `/background-images/${file}`)
  } catch {
    return []
  }
}

export default function Home() {
  const backgroundImages = getBackgroundImages()

  return (
    <>
      <BackgroundCarousel images={backgroundImages} interval={5000} />
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="text-center text-white max-w-5xl mx-auto px-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-3 sm:mb-4 md:mb-6 drop-shadow-lg">
            WelcomeApp
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 md:mb-12 opacity-90 drop-shadow-md max-w-3xl mx-auto px-2">
            Créez des guides personnalisés pour vos locations de vacances
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-3xl mx-auto">
            <Link
              href="/demo"
              className="inline-block bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Voir la démo
            </Link>
            <Link
              href="/login"
              className="inline-block bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-white hover:text-indigo-600 transition"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="inline-block bg-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-800 transition shadow-lg"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
