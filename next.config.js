const withNextIntl = require('next-intl/plugin')()

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver React Strict Mode pour éviter le bug "Map container is already initialized"
  // avec react-leaflet. Strict Mode double-invoque les effets en dev, ce qui casse Leaflet.
  // Note: En production, ce n'est pas un problème car Strict Mode est désactivé par défaut.
  reactStrictMode: false,

  images: {
    // Optimisation Vercel : réduire les transformations et cache writes
    minimumCacheTTL: 2678400, // 31 jours (recommandation Vercel)
    formats: ['image/webp'], // WebP uniquement (-50% transformations vs AVIF+WebP)
    qualities: [50, 65, 75, 85], // Limiter aux qualités utilisées dans l'app

    // Remote patterns : uniquement sources utilisées
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Supabase Storage (tips media, backgrounds, logos)
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com', // Google Maps (SmartFill)
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Places photos redirect
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com', // Google Places photos redirect (fallback)
      },
      {
        protocol: 'http',
        hostname: 'localhost', // Dev uniquement
      },
    ],

    // Tailles optimisées pour breakpoints Tailwind + usages réels
    deviceSizes: [640, 768, 1024, 1280, 1920],
    imageSizes: [32, 64, 96, 128, 256],
  },
  // Optimisations pour Vercel
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Empêcher les erreurs de build à cause de TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Optimisations webpack pour dev mode
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Source maps rapides en dev (suffisant pour debugging)
      config.devtool = 'eval-cheap-module-source-map'

      // Désactiver minimization en dev (inutile)
      config.optimization.minimize = false

      // Cache filesystem optimisé
      if (config.cache && config.cache.type === 'filesystem') {
        config.cache.maxAge = 5 * 24 * 60 * 60 * 1000 // 5 jours
      }
    }
    return config
  },

  // Optimisations expérimentales : tree-shaking automatique des dépendances lourdes
  experimental: {
    optimizePackageImports: [
      'recharts',                      // Analytics charts
      'lucide-react',                  // Icons
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'leaflet',                       // Maps
      'react-leaflet',
    ],
  },

  // Réduire pages gardées en mémoire en dev
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,  // 1 min
    pagesBufferLength: 2,        // Max 2 pages inactives
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },
}

module.exports = withNextIntl(nextConfig)
