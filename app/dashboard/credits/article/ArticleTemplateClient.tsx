'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Check, FileText, Code, Coins, ExternalLink, Gift, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitBlogArticle } from '@/lib/actions/share-social-post'
import type { User } from '@supabase/supabase-js'

interface ArticleTemplateClientProps {
  user: User
  clientName: string
  clientSlug: string
}

export default function ArticleTemplateClient({ user, clientName, clientSlug }: ArticleTemplateClientProps) {
  const router = useRouter()
  const [copiedText, setCopiedText] = useState(false)
  const [copiedHtml, setCopiedHtml] = useState(false)
  const [articleUrl, setArticleUrl] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const welcomeappUrl = 'https://welcomeapp.be'
  const demoUrl = 'https://welcomeapp.be/demo'
  const myWelcomebookUrl = `https://welcomeapp.be/${clientSlug}`

  // Template texte (pour WordPress, blog classique, etc.)
  const textTemplate = `Comment j'ai amélioré l'expérience de mes voyageurs avec un livret d'accueil digital

En tant que propriétaire de location de vacances, j'ai toujours cherché des moyens d'améliorer l'expérience de mes voyageurs tout en simplifiant ma gestion quotidienne. C'est pourquoi j'ai découvert WelcomeApp, une solution qui a véritablement transformé la façon dont j'accueille mes hôtes.

🏠 Le problème des livrets d'accueil traditionnels

Avant, je passais des heures à créer des documents PDF ou Word avec toutes les informations pratiques : codes d'accès, recommandations de restaurants, activités à faire dans la région... Le problème ? Ces documents étaient souvent perdus, jamais lus, ou déjà obsolètes au moment où les voyageurs arrivaient.

💡 La solution : un livret d'accueil digital accessible avant l'arrivée

Avec WelcomeApp (${welcomeappUrl}), j'ai créé un livret d'accueil digital que j'envoie à mes voyageurs AVANT leur arrivée. Ils peuvent ainsi :

• Préparer leur séjour tranquillement depuis chez eux
• Découvrir mes meilleures recommandations locales
• Avoir toutes les informations pratiques sur leur téléphone
• Accéder au livret même sans connexion internet (PWA)

🎯 Les avantages concrets

1. Gain de temps considérable : Plus besoin de répondre 10 fois aux mêmes questions
2. Meilleure expérience voyageur : Ils arrivent déjà informés et enthousiastes
3. Mise à jour instantanée : Un restaurant a fermé ? Je modifie en 2 clics
4. Image professionnelle : Mon livret reflète la qualité de ma location
5. Moins de stress : Les voyageurs sont autonomes dès leur arrivée

📱 Comment ça fonctionne ?

C'est très simple : je crée mon livret avec mes conseils personnalisés, je personnalise les couleurs à mon image, et j'envoie le lien à mes voyageurs dès la réservation confirmée. Ils peuvent même l'installer sur leur téléphone comme une application !

Vous pouvez voir une démonstration ici : ${demoUrl}

🌟 Mon conseil

Si vous êtes propriétaire d'une location de vacances et que vous souhaitez offrir une expérience premium à vos voyageurs tout en vous simplifiant la vie, je vous recommande vraiment d'essayer WelcomeApp. C'est gratuit pour commencer et ça change tout !

→ Découvrir WelcomeApp : ${welcomeappUrl}
→ Voir la démo : ${demoUrl}

---
Article rédigé par le propriétaire de ${clientName}`

  // Template HTML (pour intégration directe)
  const htmlTemplate = `<!-- Article WelcomeApp - Copiez ce code HTML dans votre site -->
<article class="welcomeapp-article" style="max-width: 800px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333;">

  <h1 style="font-size: 2em; color: #1a1a1a; margin-bottom: 0.5em;">
    Comment j'ai amélioré l'expérience de mes voyageurs avec un livret d'accueil digital
  </h1>

  <p style="font-size: 1.1em; color: #666; margin-bottom: 2em;">
    En tant que propriétaire de location de vacances, j'ai toujours cherché des moyens d'améliorer l'expérience de mes voyageurs tout en simplifiant ma gestion quotidienne. C'est pourquoi j'ai découvert <a href="${welcomeappUrl}" target="_blank" rel="noopener" style="color: #4f46e5; text-decoration: none; font-weight: 600;">WelcomeApp</a>, une solution qui a véritablement transformé la façon dont j'accueille mes hôtes.
  </p>

  <h2 style="font-size: 1.5em; color: #1a1a1a; margin-top: 2em;">🏠 Le problème des livrets d'accueil traditionnels</h2>

  <p>
    Avant, je passais des heures à créer des documents PDF ou Word avec toutes les informations pratiques : codes d'accès, recommandations de restaurants, activités à faire dans la région... Le problème ? Ces documents étaient souvent <strong>perdus, jamais lus, ou déjà obsolètes</strong> au moment où les voyageurs arrivaient.
  </p>

  <h2 style="font-size: 1.5em; color: #1a1a1a; margin-top: 2em;">💡 La solution : un livret d'accueil digital accessible avant l'arrivée</h2>

  <p>
    Avec <a href="${welcomeappUrl}" target="_blank" rel="noopener" style="color: #4f46e5; text-decoration: none; font-weight: 600;">WelcomeApp</a>, j'ai créé un livret d'accueil digital que j'envoie à mes voyageurs <strong>AVANT leur arrivée</strong>. Ils peuvent ainsi :
  </p>

  <ul style="margin: 1em 0; padding-left: 1.5em;">
    <li style="margin: 0.5em 0;">✅ Préparer leur séjour tranquillement depuis chez eux</li>
    <li style="margin: 0.5em 0;">✅ Découvrir mes meilleures recommandations locales</li>
    <li style="margin: 0.5em 0;">✅ Avoir toutes les informations pratiques sur leur téléphone</li>
    <li style="margin: 0.5em 0;">✅ Accéder au livret même sans connexion internet (PWA)</li>
  </ul>

  <h2 style="font-size: 1.5em; color: #1a1a1a; margin-top: 2em;">🎯 Les avantages concrets</h2>

  <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 1.5em; border-radius: 12px; margin: 1em 0;">
    <ol style="margin: 0; padding-left: 1.5em;">
      <li style="margin: 0.75em 0;"><strong>Gain de temps considérable</strong> : Plus besoin de répondre 10 fois aux mêmes questions</li>
      <li style="margin: 0.75em 0;"><strong>Meilleure expérience voyageur</strong> : Ils arrivent déjà informés et enthousiastes</li>
      <li style="margin: 0.75em 0;"><strong>Mise à jour instantanée</strong> : Un restaurant a fermé ? Je modifie en 2 clics</li>
      <li style="margin: 0.75em 0;"><strong>Image professionnelle</strong> : Mon livret reflète la qualité de ma location</li>
      <li style="margin: 0.75em 0;"><strong>Moins de stress</strong> : Les voyageurs sont autonomes dès leur arrivée</li>
    </ol>
  </div>

  <h2 style="font-size: 1.5em; color: #1a1a1a; margin-top: 2em;">📱 Comment ça fonctionne ?</h2>

  <p>
    C'est très simple : je crée mon livret avec mes conseils personnalisés, je personnalise les couleurs à mon image, et j'envoie le lien à mes voyageurs dès la réservation confirmée. Ils peuvent même l'installer sur leur téléphone comme une application !
  </p>

  <p style="text-align: center; margin: 2em 0;">
    <a href="${demoUrl}" target="_blank" rel="noopener" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 1em 2em; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
      👀 Voir une démonstration
    </a>
  </p>

  <h2 style="font-size: 1.5em; color: #1a1a1a; margin-top: 2em;">🌟 Mon conseil</h2>

  <p>
    Si vous êtes propriétaire d'une location de vacances et que vous souhaitez offrir une <strong>expérience premium</strong> à vos voyageurs tout en vous simplifiant la vie, je vous recommande vraiment d'essayer WelcomeApp. C'est gratuit pour commencer et ça change tout !
  </p>

  <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 1.5em; border-radius: 12px; margin: 2em 0; text-align: center;">
    <p style="margin: 0 0 1em 0; font-size: 1.1em; font-weight: 600; color: #92400e;">
      🚀 Prêt à transformer l'accueil de vos voyageurs ?
    </p>
    <a href="${welcomeappUrl}" target="_blank" rel="noopener" style="display: inline-block; background: #4f46e5; color: white; padding: 0.75em 1.5em; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 0.25em;">
      Découvrir WelcomeApp
    </a>
    <a href="${demoUrl}" target="_blank" rel="noopener" style="display: inline-block; background: white; color: #4f46e5; padding: 0.75em 1.5em; border-radius: 6px; text-decoration: none; font-weight: 600; border: 2px solid #4f46e5; margin: 0.25em;">
      Voir la démo
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 2em 0;">

  <p style="font-size: 0.9em; color: #6b7280; font-style: italic;">
    Article rédigé par le propriétaire de ${clientName}
  </p>

</article>
<!-- Fin de l'article WelcomeApp -->`

  const handleCopy = async (content: string, type: 'text' | 'html') => {
    try {
      await navigator.clipboard.writeText(content)
      if (type === 'text') {
        setCopiedText(true)
        setTimeout(() => setCopiedText(false), 2000)
      } else {
        setCopiedHtml(true)
        setTimeout(() => setCopiedHtml(false), 2000)
      }
    } catch (err) {
      console.error('Erreur copie:', err)
    }
  }

  const handleSubmit = async () => {
    if (!articleUrl.trim()) {
      setError('Veuillez entrer l\'URL de votre article')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const result = await submitBlogArticle(articleUrl.trim())

      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error || 'Une erreur est survenue')
      }
    } catch (err) {
      console.error('Erreur soumission article:', err)
      setError('Une erreur est survenue lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/credits/earn">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux partages
            </Button>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              Template d'Article Blog
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Publiez cet article sur votre site pour gagner des crédits et améliorer votre SEO
            </p>
          </div>

          {/* Info Box */}
          <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-200 dark:border-indigo-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Gift className="h-5 w-5 text-indigo-600" />
              Pourquoi publier cet article ?
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span><strong>+150 crédits</strong> pour votre compte WelcomeApp</span>
                </p>
                <p className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Améliore le <strong>SEO de votre site</strong> (contenu de qualité)</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Aide au <strong>référencement de WelcomeApp</strong> (backlinks)</span>
                </p>
                <p className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Montre votre <strong>professionnalisme</strong> aux voyageurs</span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Templates */}
        <Card className="p-6 mb-8">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Version Texte
              </TabsTrigger>
              <TabsTrigger value="html" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Version HTML
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Idéal pour WordPress, Medium, ou tout éditeur de blog
                  </p>
                  <Button
                    onClick={() => handleCopy(textTemplate, 'text')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {copiedText ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copier le texte
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans">
                    {textTemplate}
                  </pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="html">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Code HTML prêt à intégrer avec mise en forme incluse
                  </p>
                  <Button
                    onClick={() => handleCopy(htmlTemplate, 'html')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {copiedHtml ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copier le HTML
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
                    {htmlTemplate}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Aperçu */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Aperçu de l'article
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Aperçu sur fond blanc (tel qu'il apparaîtra sur la plupart des sites)
          </p>
          {/* Force white background for preview since HTML template has inline styles for light mode */}
          <div
            className="bg-white p-6 rounded-lg border border-gray-200 prose prose-indigo max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlTemplate }}
          />
        </Card>

        {/* Soumission */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            Récupérer vos crédits
          </h3>

          {submitted ? (
            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-700 text-center">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Merci ! 🎉
              </h4>
              <p className="text-green-700 dark:text-green-300">
                Votre article a été soumis. Vos <strong>+150 crédits</strong> seront ajoutés après vérification.
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Nous vérifions généralement sous 24-48h.
              </p>
              <Link href="/dashboard/credits">
                <Button variant="outline" className="mt-4">
                  Retour aux crédits
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Une fois l'article publié sur votre site, entrez l'URL ci-dessous pour recevoir vos crédits :
              </p>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="article-url">URL de votre article publié</Label>
                <div className="flex gap-2">
                  <Input
                    id="article-url"
                    type="url"
                    placeholder="https://votre-site.com/blog/mon-article-welcomeapp"
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    disabled={submitting}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!articleUrl.trim() || submitting}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      'Soumettre'
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg">
                <Badge className="bg-amber-500 text-white">+150 crédits</Badge>
                <span>après vérification de la publication</span>
              </div>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vous avez des questions ?{' '}
            <a href="mailto:contact@welcomeapp.be" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Contactez-nous
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
