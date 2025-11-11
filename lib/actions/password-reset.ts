'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { PasswordChangedEmail } from '@/emails/templates/PasswordChangedEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

// ============================================
// Types & Interfaces
// ============================================

export interface PasswordResetResult {
  success: boolean
  error?: string
  secondsRemaining?: number
}

export interface CooldownStatus {
  canReset: boolean
  attemptsCount: number
  secondsRemaining: number
  nextAttemptAt: string | null
}

// ============================================
// 1. Vérifier le Rate Limit (Cooldown)
// ============================================

/**
 * Vérifie si un utilisateur peut demander un reset de mot de passe
 * Rate limit : Max 4 tentatives/heure, cooldown 15 minutes entre tentatives
 */
export async function checkPasswordResetCooldown(email: string): Promise<CooldownStatus> {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await (supabase as any)
      .rpc('check_password_reset_cooldown', { p_email: email.toLowerCase() })

    if (error) {
      console.error('[PASSWORD RESET] Erreur cooldown check:', error)
      // En cas d'erreur, on autorise (fail-open) pour ne pas bloquer les utilisateurs légitimes
      return {
        canReset: true,
        attemptsCount: 0,
        secondsRemaining: 0,
        nextAttemptAt: null,
      }
    }

    const result = data[0]
    return {
      canReset: result.can_reset,
      attemptsCount: result.attempts_count || 0,
      secondsRemaining: result.seconds_remaining || 0,
      nextAttemptAt: result.next_attempt_at,
    }
  } catch (error) {
    console.error('[PASSWORD RESET] Erreur:', error)
    return {
      canReset: true,
      attemptsCount: 0,
      secondsRemaining: 0,
      nextAttemptAt: null,
    }
  }
}

// ============================================
// 2. Demander un Reset de Mot de Passe
// ============================================

/**
 * Demande un reset de mot de passe pour un email donné
 * - Vérifie le rate limit (max 4 tentatives/heure)
 * - Envoie un email via Supabase Auth (gratuit, tokens OTP sécurisés)
 * - Log la tentative dans la base de données
 * - Message générique si l'email n'existe pas (sécurité : évite l'énumération d'emails)
 */
export async function requestPasswordReset(
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<PasswordResetResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Validation de l'email
    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: 'Veuillez saisir une adresse email valide',
      }
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 1. Vérifier le rate limit
    const cooldownStatus = await checkPasswordResetCooldown(normalizedEmail)

    if (!cooldownStatus.canReset) {
      const minutes = Math.ceil(cooldownStatus.secondsRemaining / 60)
      return {
        success: false,
        error: `Trop de tentatives. Veuillez réessayer dans ${minutes} minute${minutes > 1 ? 's' : ''}.`,
        secondsRemaining: cooldownStatus.secondsRemaining,
      }
    }

    // 2. Log la tentative (avant l'envoi pour tracker même les échecs)
    try {
      await (supabase as any).rpc('log_password_reset_attempt', {
        p_email: normalizedEmail,
        p_ip_address: ipAddress || null,
        p_user_agent: userAgent || null,
      })
    } catch (logError) {
      console.error('[PASSWORD RESET] Erreur log tentative:', logError)
      // Non bloquant
    }

    // 3. Envoyer l'email de reset via Supabase Auth
    // Note: Supabase enverra l'email UNIQUEMENT si l'email existe dans auth.users
    // Mais on retourne toujours un message générique pour ne pas révéler si l'email existe
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://welcomeapp.be'}/reset-password`,
    })

    if (resetError) {
      console.error('[PASSWORD RESET] Erreur Supabase resetPasswordForEmail:', resetError)
      // Ne pas révéler l'erreur à l'utilisateur (sécurité)
      // Message générique
    }

    // 4. Retourner un message de succès générique (même si l'email n'existe pas)
    // Cela empêche l'énumération d'emails (attaquant ne peut pas savoir si email existe)
    return {
      success: true,
      error: undefined,
    }
  } catch (error) {
    console.error('[PASSWORD RESET] Erreur globale:', error)
    return {
      success: false,
      error: 'Une erreur est survenue. Veuillez réessayer plus tard.',
    }
  }
}

// ============================================
// 3. Réinitialiser le Mot de Passe
// ============================================

/**
 * Met à jour le mot de passe de l'utilisateur actuellement authentifié
 * - Validation du mot de passe (min 6 caractères)
 * - Met à jour via supabase.auth.updateUser()
 * - Envoie un email de confirmation (via Resend)
 *
 * Note: Cette fonction doit être appelée APRÈS que l'utilisateur ait cliqué sur le lien
 * de reset et soit automatiquement authentifié par Supabase (via le token OTP)
 */
export async function resetPassword(newPassword: string): Promise<PasswordResetResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // 1. Vérifier que l'utilisateur est authentifié (via le token de reset)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: 'Session invalide ou expirée. Veuillez redemander un lien de réinitialisation.',
      }
    }

    // 2. Validation du mot de passe
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères',
      }
    }

    // 3. Mettre à jour le mot de passe via Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('[PASSWORD RESET] Erreur updateUser:', updateError)
      return {
        success: false,
        error: 'Impossible de mettre à jour le mot de passe. Veuillez réessayer.',
      }
    }

    // 4. Envoyer email de confirmation (via Resend)
    try {
      await sendPasswordChangedEmail(user.email!)
    } catch (emailError) {
      console.error('[PASSWORD RESET] Erreur envoi email confirmation:', emailError)
      // Non bloquant : le mot de passe est déjà changé
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('[PASSWORD RESET] Erreur globale resetPassword:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

// ============================================
// 4. Envoyer Email de Confirmation
// ============================================

/**
 * Envoie un email de confirmation après changement de mot de passe
 * - Template React Email personnalisé (PasswordChangedEmail)
 * - Envoie via Resend
 * - Warning : "Si ce n'est pas vous, contactez-nous"
 */
async function sendPasswordChangedEmail(email: string): Promise<void> {
  try {
    // Récupérer le nom du gestionnaire depuis la base de données
    const supabase = await createServerSupabaseClient()
    const { data: client } = await supabase
      .from('clients')
      .select('property_name')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    const managerName = client?.property_name || 'Gestionnaire'

    // Rendre le template React Email en HTML
    const emailHtml = await render(
      PasswordChangedEmail({
        managerName,
        managerEmail: email,
      })
    )

    // Envoyer via Resend
    const { error } = await resend.emails.send({
      from: 'WelcomeApp <hello@welcomeapp.be>',
      to: email,
      subject: 'Votre mot de passe a été modifié',
      html: emailHtml,
    })

    if (error) {
      console.error('[PASSWORD RESET] Erreur envoi email confirmation:', error)
      throw error
    }

    console.log(`[PASSWORD RESET] Email de confirmation envoyé à ${email}`)
  } catch (error) {
    console.error('[PASSWORD RESET] Erreur sendPasswordChangedEmail:', error)
    throw error
  }
}
