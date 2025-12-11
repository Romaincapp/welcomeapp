'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createWelcomebookServerAction, checkEmailExists, checkSlugExists, checkSignupRateLimit, logSignupAttempt } from '@/lib/actions/create-welcomebook'
import { sendWelcomeEmail } from '@/lib/actions/email/sendWelcomeEmail'
import { sendAdminNotificationEmail } from '@/lib/actions/email/sendAdminNotificationEmail'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Check, X, Loader2 } from 'lucide-react'

// Fonction utilitaire pour générer un slug depuis un nom
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function SignUpPage() {
  const [propertyName, setPropertyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // États pour validation temps réel
  const [generatedSlug, setGeneratedSlug] = useState('')
  const [emailAvailable, setEmailAvailable] = useState<null | boolean>(null)
  const [emailChecking, setEmailChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<null | boolean>(null)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugSuggestion, setSlugSuggestion] = useState<string | null>(null)

  // Protection ULTRA stricte contre les doubles soumissions avec useRef
  const isSubmittingRef = useRef(false)

  // 🍯 HONEYPOT : Champ piège invisible pour les bots
  const [honeypot, setHoneypot] = useState('')

  // Debounce timers
  const emailTimerRef = useRef<NodeJS.Timeout | null>(null)
  const slugTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Générer le slug à chaque changement de propertyName
  useEffect(() => {
    const slug = generateSlug(propertyName)
    setGeneratedSlug(slug)

    // Reset l'état de vérification
    setSlugAvailable(null)
    setSlugSuggestion(null)

    // Vérifier le slug avec debounce (500ms)
    if (slug.length > 0) {
      if (slugTimerRef.current) clearTimeout(slugTimerRef.current)

      setSlugChecking(true)
      slugTimerRef.current = setTimeout(async () => {
        try {
          const result = await checkSlugExists(slug)
          setSlugAvailable(!result.exists)
          setSlugSuggestion(result.suggestion || null)
          setSlugChecking(false)
        } catch (err) {
          console.error('Erreur vérification slug:', err)
          setSlugChecking(false)
        }
      }, 500)
    } else {
      setSlugChecking(false)
    }

    return () => {
      if (slugTimerRef.current) clearTimeout(slugTimerRef.current)
    }
  }, [propertyName])

  // Vérifier l'email avec debounce
  useEffect(() => {
    setEmailAvailable(null)

    if (email.length > 0 && email.includes('@')) {
      if (emailTimerRef.current) clearTimeout(emailTimerRef.current)

      setEmailChecking(true)
      emailTimerRef.current = setTimeout(async () => {
        try {
          const result = await checkEmailExists(email)
          setEmailAvailable(!result.exists)
          setEmailChecking(false)
        } catch (err) {
          console.error('Erreur vérification email:', err)
          setEmailChecking(false)
        }
      }, 500)
    } else {
      setEmailChecking(false)
    }

    return () => {
      if (emailTimerRef.current) clearTimeout(emailTimerRef.current)
    }
  }, [email])

  // Vérifier si le formulaire est valide
  const isFormValid =
    propertyName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    emailAvailable === true &&
    slugAvailable === true &&
    !emailChecking &&
    !slugChecking

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    // ========================================
    // 🛡️ PROTECTION ANTI-BOT : Honeypot Check
    // ========================================
    if (honeypot) {
      console.log('[SIGNUP] 🤖 Bot détecté via honeypot - bloqué')
      // Logger la tentative bloquée
      await logSignupAttempt({
        email,
        propertyName,
        success: false,
        blocked: true
      })
      // Faire semblant de traiter la demande (ne pas révéler le piège au bot)
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setError('Une erreur est survenue. Veuillez réessayer plus tard.')
      setLoading(false)
      return
    }

    // ========================================
    // 🛡️ PROTECTION ANTI-BOT : Validation Pattern
    // ========================================
    // Détecter si le nom du logement contient un email (comportement bot typique)
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    if (emailPattern.test(propertyName)) {
      console.log('[SIGNUP] 🤖 Bot détecté - email dans propertyName')
      // Logger la tentative bloquée
      await logSignupAttempt({
        email,
        propertyName,
        success: false,
        blocked: true
      })
      setError('Le nom du logement ne peut pas contenir d\'adresse email.')
      return
    }

    // ========================================
    // 🛡️ PROTECTION ANTI-BOT : Rate Limiting
    // ========================================
    const rateLimitCheck = await checkSignupRateLimit()
    if (!rateLimitCheck.allowed) {
      console.log('[SIGNUP] 🚫 Rate limit dépassé:', rateLimitCheck.reason)
      // Logger la tentative bloquée
      await logSignupAttempt({
        email,
        propertyName,
        success: false,
        blocked: true
      })

      const minutes = rateLimitCheck.retryAfterSeconds
        ? Math.ceil(rateLimitCheck.retryAfterSeconds / 60)
        : 5

      setError(rateLimitCheck.reason || `Trop de tentatives. Veuillez réessayer dans ${minutes} minute(s).`)
      return
    }

    // ========================================
    // PROTECTION MULTI-NIVEAUX contre double-soumission
    // ========================================
    // useRef survit aux re-renders (React Strict Mode en dev exécute les Server Actions 2x)
    if (isSubmittingRef.current) {
      console.log('[SIGNUP] Soumission déjà en cours - bloqué')
      return
    }

    if (loading || success) {
      console.log('[SIGNUP] État invalide - bloqué')
      return
    }

    if (!isFormValid) {
      setError('Veuillez corriger les erreurs avant de continuer.')
      return
    }

    // Verrouillage immédiat pour empêcher les appels multiples
    isSubmittingRef.current = true
    setLoading(true)
    setError(null)

    try {
      // ========================================
      // ÉTAPE 1: Double vérification email (protection contre race condition)
      // ========================================
      // Nécessaire car la validation en temps réel peut être en retard par rapport à la soumission
      const emailDoubleCheck = await checkEmailExists(email)
      if (emailDoubleCheck.exists) {
        throw new Error(`Un compte existe déjà avec cet email (${emailDoubleCheck.slug}). Veuillez vous connecter.`)
      }

      // ========================================
      // ÉTAPE 2: Créer le compte Auth Supabase
      // ========================================
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard/welcome`,
        },
      })

      if (error) {
        // Détecter si l'utilisateur Auth existe déjà (compte orphelin)
        if (error.message.includes('User already registered') || error.message.includes('already registered')) {
          throw new Error('Un compte existe déjà avec cet email. Veuillez vous connecter.')
        }
        throw error
      }

      if (!data.user) {
        throw new Error('Erreur lors de la création du compte')
      }

      console.log('[SIGNUP] Compte Auth créé:', data.user.id)

      // ========================================
      // ÉTAPE 3: Attendre synchronisation session serveur
      // ========================================
      // La session côté client n'est pas immédiatement disponible côté serveur
      await new Promise(resolve => setTimeout(resolve, 1500))

      // ========================================
      // ÉTAPE 4: Créer le welcomebook (Server Action idempotente)
      // ========================================
      // Note: La Server Action est idempotente (peut être appelée 2x sans erreur)
      // En dev, React Strict Mode l'appellera 2 fois

      const result = await createWelcomebookServerAction(email, propertyName, data.user.id)

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création du welcomebook')
      }

      console.log('[SIGNUP] Welcomebook créé avec succès')

      // ========================================
      // ÉTAPE 4.5: Logger la tentative réussie (rate limiting)
      // ========================================
      await logSignupAttempt({
        email,
        propertyName,
        success: true,
        blocked: false
      })

      // ========================================
      // ÉTAPE 5: Envoyer l'email de bienvenue (non-bloquant)
      // ========================================
      // On envoie l'email en arrière-plan sans bloquer la redirection
      try {
        const emailResult = await sendWelcomeEmail({
          managerName: result.data.name,
          managerEmail: result.data.email,
          slug: result.data.slug,
          clientId: result.data.id,
        })

        if (emailResult.success) {
          console.log('[SIGNUP] Email de bienvenue envoyé avec succès:', emailResult.emailId)
        } else {
          console.error('[SIGNUP] Erreur envoi email de bienvenue:', emailResult.error)
        }
      } catch (emailError) {
        // Log mais ne pas faire échouer le signup si l'email échoue
        console.error('[SIGNUP] Erreur inattendue lors de l\'envoi de l\'email:', emailError)
      }

      // Envoyer notification admin (non-bloquant)
      try {
        const adminNotifResult = await sendAdminNotificationEmail({
          managerName: result.data.name,
          managerEmail: result.data.email,
          slug: result.data.slug,
          createdAt: new Date().toISOString(),
        })

        if (adminNotifResult.success) {
          console.log('[SIGNUP] Notification admin envoyée avec succès:', adminNotifResult.emailId)
        } else {
          console.error('[SIGNUP] Erreur envoi notification admin:', adminNotifResult.error)
        }
      } catch (adminError) {
        // Log mais ne pas faire échouer le signup si l'email échoue
        console.error('[SIGNUP] Erreur inattendue lors de l\'envoi de la notification admin:', adminError)
      }

      // ========================================
      // ÉTAPE 6: Redirection vers onboarding
      // ========================================
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/welcome')
      }, 1500)

    } catch (err: any) {
      console.error('[SIGNUP] Erreur:', err.message)
      setError(err.message || 'Erreur lors de la création du compte')
      setLoading(false)
      // Déverrouiller pour permettre de réessayer
      isSubmittingRef.current = false
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <>
      <div className="bg-fixed-mobile bg-gradient-to-br from-indigo-500 to-purple-600 -z-10" />
      <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 force-light-theme">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Créer un compte gestionnaire</h1>

        {success ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <p className="font-semibold mb-2">✅ Compte créé avec succès !</p>
            <p className="text-sm">Démarrage de l'onboarding...</p>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Nom du logement avec validation slug */}
            <div>
              <label htmlFor="propertyName" className="block text-sm font-medium mb-2 text-gray-900">
                Nom de votre logement
              </label>
              <div className="relative">
                <input
                  id="propertyName"
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  required
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    slugAvailable === false ? 'border-red-500' :
                    slugAvailable === true ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder="Villa des Lilas"
                />
                {/* Indicateur de statut slug */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {slugChecking && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                  {!slugChecking && slugAvailable === true && <Check className="w-5 h-5 text-green-600" />}
                  {!slugChecking && slugAvailable === false && <X className="w-5 h-5 text-red-600" />}
                </div>
              </div>

              {/* Affichage de l'URL */}
              {generatedSlug && (
                <div className="mt-1">
                  <p className={`text-xs ${
                    slugAvailable === false ? 'text-red-600' :
                    slugAvailable === true ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    Votre URL : <strong>welcomeapp.be/{generatedSlug}</strong>
                    {slugChecking && ' (vérification...)'}
                    {slugAvailable === false && ' (déjà pris)'}
                    {slugAvailable === true && ' (disponible ✓)'}
                  </p>

                  {/* Suggestion si slug pris */}
                  {slugAvailable === false && slugSuggestion && (
                    <button
                      type="button"
                      onClick={() => setPropertyName(slugSuggestion.replace(/-/g, ' '))}
                      className="text-xs text-indigo-600 hover:underline mt-1"
                    >
                      Essayer : <strong>{slugSuggestion}</strong>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Email avec validation */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-900">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    emailAvailable === false ? 'border-red-500' :
                    emailAvailable === true ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder="contact@exemple.com"
                />
                {/* Indicateur de statut email */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {emailChecking && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                  {!emailChecking && emailAvailable === true && <Check className="w-5 h-5 text-green-600" />}
                  {!emailChecking && emailAvailable === false && <X className="w-5 h-5 text-red-600" />}
                </div>
              </div>

              {/* Message d'erreur email */}
              {emailAvailable === false && (
                <p className="text-xs text-red-600 mt-1">
                  Un compte existe déjà avec cet email. Utilisez le bouton "Supprimer mon compte" dans le dashboard pour repartir de zéro.
                </p>
              )}
              {emailAvailable === true && (
                <p className="text-xs text-green-600 mt-1">
                  Email disponible ✓
                </p>
              )}
            </div>

            {/* 🍯 HONEYPOT : Champ piège invisible pour les bots */}
            {/* Les bots remplissent tous les champs, les humains ne voient pas celui-ci */}
            <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
              <label htmlFor="website">Website (do not fill)</label>
              <input
                id="website"
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-900">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-700 mt-1">Minimum 6 caractères</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid || loading || success}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </button>

            {/* Message explicatif si le bouton est désactivé */}
            {!isFormValid && propertyName && email && password.length >= 6 && (
              <p className="text-xs text-center text-gray-600">
                Veuillez attendre la validation de l'email et du nom du logement...
              </p>
            )}
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-indigo-600 hover:underline font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
      </div>
    </>
  )
}
