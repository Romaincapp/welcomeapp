import type { Metadata, Viewport } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: {
    default: 'WelcomeApp - Welcomebook Digital pour Locations de Vacances',
    template: '%s | WelcomeApp'
  },
  description: 'Créez votre welcomebook digital pour simplifier la gestion et l\'accueil de vos voyageurs. Solution professionnelle pour gestionnaires de locations de vacances.',
  metadataBase: new URL('https://welcomeapp.be'),
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
