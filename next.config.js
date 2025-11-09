const withNextIntl = require('next-intl/plugin')()

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Empêcher les erreurs de build à cause de TypeScript ou ESLint
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
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
