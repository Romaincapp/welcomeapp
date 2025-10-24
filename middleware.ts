import { NextRequest, NextResponse } from 'next/server'

// Middleware minimaliste - on laisse le routing Next.js gérer les locales
// Le client détectera la locale depuis l'URL
export default function middleware(request: NextRequest) {
  // Pas de redirection, juste laisser passer
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)', '/']
}
