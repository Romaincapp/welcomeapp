'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { getTipsNeedingComments, generateCommentsForClient } from '@/lib/actions/generate-comments'
import { checkGenerationCooldown, checkDailyQuota } from '@/lib/actions/rate-limit'

interface AICommentsBannerProps {
  clientId: string
  clientSlug: string
}

export default function AICommentsBanner({ clientId, clientSlug }: AICommentsBannerProps) {
  const [tipsCount, setTipsCount] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<{
    current: number
    total: number
  } | null>(null)
  const [result, setResult] = useState<{
    generated: number
    failed: number
  } | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showBanner, setShowBanner] = useState(true)

  // 🛡️ Rate limiting states
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0)
  const [quotaUsed, setQuotaUsed] = useState<number>(0)
  const [quotaMax, setQuotaMax] = useState<number>(100)
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)

  // Charger le nombre de tips + vérifier rate limiting au montage
  useEffect(() => {
    loadTipsCount()
    checkRateLimiting()
  }, [clientId])

  // Countdown timer pour le cooldown
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            setRateLimitError(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldownSeconds])

  const checkRateLimiting = async () => {
    try {
      // Vérifier le cooldown
      const cooldown = await checkGenerationCooldown(clientId)
      if (!cooldown.canGenerate) {
        setCooldownSeconds(cooldown.secondsRemaining)
        const minutes = Math.ceil(cooldown.secondsRemaining / 60)
        setRateLimitError(`Veuillez patienter ${minutes} minute${minutes > 1 ? 's' : ''} avant de relancer`)
      }

      // Vérifier le quota
      const quota = await checkDailyQuota(clientId)
      setQuotaUsed(quota.usedCount)
      setQuotaMax(quota.maxCount)
      if (!quota.canGenerate) {
        setRateLimitError(`Quota quotidien atteint (${quota.usedCount}/${quota.maxCount}). Réessayez demain.`)
      }
    } catch (error) {
      console.error('[BANNER] Erreur rate limiting check:', error)
    }
  }

  const loadTipsCount = async () => {
    const { success, tips } = await getTipsNeedingComments(clientId)
    if (success && tips) {
      setTipsCount(tips.length)
    }
  }

  const handleGenerateComments = async () => {
    // Bloquer si rate limit actif
    if (cooldownSeconds > 0 || rateLimitError) {
      return
    }

    setIsGenerating(true)
    setResult(null)
    setRateLimitError(null)
    setProgress({ current: 0, total: tipsCount || 0 })

    // Simuler la progression (approximation - l'API génère séquentiellement)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (!prev || prev.current >= prev.total - 1) return prev
        return { ...prev, current: prev.current + 1 }
      })
    }, 3000) // ~3 secondes par tip (approximation)

    try {
      const result = await generateCommentsForClient(clientId)

      clearInterval(interval)

      if (result.success) {
        setResult({
          generated: result.generated || 0,
          failed: result.failed || 0
        })
        setProgress({ current: result.generated || 0, total: tipsCount || 0 })
        setTipsCount(0) // Plus de tips à traiter
        setShowResult(true)
        // Recharger le rate limiting après succès
        await checkRateLimiting()
      } else {
        // Erreur de rate limiting
        if (result.error && (result.error.includes('patienter') || result.error.includes('Quota'))) {
          setRateLimitError(result.error)
          if ('cooldownSeconds' in result && typeof result.cooldownSeconds === 'number') {
            setCooldownSeconds(result.cooldownSeconds)
          }
        } else {
          alert(`Erreur: ${result.error}`)
        }
      }
    } catch (error) {
      clearInterval(interval)
      alert('Erreur lors de la génération des commentaires')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Ne rien afficher si:
  // - Pas encore chargé
  // - Aucun tip à traiter
  // - Banner fermé manuellement
  // - Résultat affiché (terminé)
  if (tipsCount === null || tipsCount === 0 || !showBanner || showResult) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-6 mb-8 text-white">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">
            ✨ Améliorez vos conseils avec l'IA !
          </h3>
          <p className="text-indigo-100 mb-4">
            Vous avez <span className="font-bold text-white">{tipsCount} conseil{tipsCount > 1 ? 's' : ''}</span> avec des avis Google
            mais sans description personnelle. L'IA peut générer automatiquement des commentaires chaleureux
            et engageants basés sur les meilleurs avis.
          </p>

          {/* 🛡️ Message de rate limiting (cooldown ou quota) */}
          {rateLimitError && (
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-100">
                  {rateLimitError}
                </p>
                {cooldownSeconds > 0 && (
                  <p className="text-xs text-yellow-200 mt-1">
                    ⏱️ Temps restant : {Math.floor(cooldownSeconds / 60)}:{String(cooldownSeconds % 60).padStart(2, '0')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 💡 Info quota */}
          {quotaUsed > 0 && !rateLimitError && (
            <p className="text-xs text-indigo-200 mb-3">
              📊 Quota du jour : {quotaUsed}/{quotaMax} générations utilisées
            </p>
          )}

          {isGenerating && progress ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">
                  Génération en cours... {progress.current}/{progress.total}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-500 ease-out"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-sm text-indigo-100">
                💡 L'IA analyse les avis et rédige des descriptions personnalisées...
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleGenerateComments}
                disabled={cooldownSeconds > 0 || !!rateLimitError}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition shadow-md ${
                  cooldownSeconds > 0 || rateLimitError
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <Sparkles size={18} />
                Générer les descriptions
              </button>

              {!rateLimitError && (
                <span className="text-sm text-indigo-100">
                  ⏱️ Temps estimé : ~{tipsCount * 3} secondes
                </span>
              )}

              <button
                onClick={() => setShowBanner(false)}
                className="ml-auto text-sm text-indigo-100 hover:text-white underline"
              >
                Plus tard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Résultat affiché en cas de succès */}
      {result && showResult && (
        <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {result.failed === 0 ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">
                  ✅ Génération terminée avec succès !
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">
                  Génération terminée avec quelques erreurs
                </span>
              </>
            )}
          </div>
          <p className="text-sm text-indigo-100">
            {result.generated} commentaire{result.generated > 1 ? 's' : ''} généré{result.generated > 1 ? 's' : ''} avec succès
            {result.failed > 0 && ` • ${result.failed} échec${result.failed > 1 ? 's' : ''}`}
          </p>
          <p className="text-xs text-indigo-100 mt-2">
            💡 Rafraîchissez la page pour voir les nouveaux commentaires dans vos conseils.
          </p>
        </div>
      )}
    </div>
  )
}
