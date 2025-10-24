import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { locales, defaultLocale } from './i18n/request'

const i18nMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'as-needed'
})

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes à exclure du middleware i18n
  const excludedPaths = [
    '/',
    '/login',
    '/signup',
    '/dashboard',
    '/api',
    '/_next',
    '/_vercel',
    '/manifest.webmanifest',
    '/robots.txt',
    '/sitemap.xml',
    '/favicon.ico'
  ]

  // Vérifier si le pathname commence par un des chemins exclus
  const isExcluded = excludedPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  )

  // Si exclu, ne pas appliquer i18n
  if (isExcluded) {
    return
  }

  // Sinon, appliquer le middleware i18n
  return i18nMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)', '/']
}
