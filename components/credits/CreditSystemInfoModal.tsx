'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Info, Zap, TrendingUp, Target, Sparkles } from 'lucide-react'

export default function CreditSystemInfoModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-500 hover:text-indigo-600"
        >
          <Info className="h-4 w-4" />
          <span className="sr-only">En savoir plus sur les crédits</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            Système de Crédits - Pay with Influence
          </DialogTitle>
          <DialogDescription>
            Gagnez des crédits en partageant votre expérience WelcomeApp sur les réseaux sociaux
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Section 1: Système de base */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Démarrage
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-700">
                🎁 <strong>150 crédits offerts</strong> à l'inscription
              </p>
              <p className="text-sm text-gray-700">
                ⏱️ <strong>1 crédit = 1 jour</strong> d'utilisation (pour 1 welcomebook)
              </p>
              <p className="text-sm text-gray-700">
                🚀 Durée initiale : <strong>~150 jours gratuits</strong> (5 mois)
              </p>
            </div>
          </section>

          {/* Section 2: Consommation accélérée */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Consommation Accélérée Multi-Welcomebooks
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-3">
                La consommation s'accélère selon le nombre de welcomebooks (-10% par welcomebook supplémentaire, max -50%)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white border-b border-orange-300">
                    <tr>
                      <th className="text-left p-2 font-semibold text-gray-700">Welcomebooks</th>
                      <th className="text-left p-2 font-semibold text-gray-700">Intervalle</th>
                      <th className="text-left p-2 font-semibold text-gray-700">Accélération</th>
                      <th className="text-left p-2 font-semibold text-gray-700">150 crédits =</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-200">
                    <tr className="bg-white">
                      <td className="p-2 font-medium">1</td>
                      <td className="p-2">24h</td>
                      <td className="p-2">0%</td>
                      <td className="p-2 font-semibold text-green-700">150 jours</td>
                    </tr>
                    <tr className="bg-orange-50/30">
                      <td className="p-2 font-medium">2</td>
                      <td className="p-2">21.6h</td>
                      <td className="p-2">-10%</td>
                      <td className="p-2 font-semibold">~135 jours</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2 font-medium">3</td>
                      <td className="p-2">19.2h</td>
                      <td className="p-2">-20%</td>
                      <td className="p-2 font-semibold">~120 jours</td>
                    </tr>
                    <tr className="bg-orange-50/30">
                      <td className="p-2 font-medium">4</td>
                      <td className="p-2">16.8h</td>
                      <td className="p-2">-30%</td>
                      <td className="p-2 font-semibold">~105 jours</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2 font-medium">5+</td>
                      <td className="p-2">12h</td>
                      <td className="p-2 text-orange-700 font-semibold">-50% (max)</td>
                      <td className="p-2 font-semibold">75 jours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 3: Gains de crédits par plateforme */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Gains de Crédits par Plateforme
            </h3>

            <div className="space-y-4">
              {/* Posts longs */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-3 text-sm">📝 Posts Longs</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🔵</span>
                      <span className="text-sm font-medium">LinkedIn</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      90 crédits → <strong>3 mois</strong>
                    </p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">📘</span>
                      <span className="text-sm font-medium">Facebook</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      90 crédits → <strong>3 mois</strong>
                    </p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">📸</span>
                      <span className="text-sm font-medium">Instagram</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      90 crédits → <strong>3 mois</strong>
                    </p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🐦</span>
                      <span className="text-sm font-medium">Twitter</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      60 crédits → <strong>2 mois</strong>
                    </p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">✍️</span>
                      <span className="text-sm font-medium">Article blog</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      180 crédits → <strong className="text-green-700">6 mois</strong>
                    </p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">📧</span>
                      <span className="text-sm font-medium">Newsletter</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      120 crédits → <strong>4 mois</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Stories */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3 text-sm">⚡ Stories (24h)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🔵</span>
                      <span className="text-sm font-medium">LinkedIn story</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      30 crédits → <strong>1 mois</strong>
                    </p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">📘</span>
                      <span className="text-sm font-medium">Facebook story</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      21 crédits → <strong>3 semaines</strong>
                    </p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">📸</span>
                      <span className="text-sm font-medium">Instagram story</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      21 crédits → <strong>3 semaines</strong>
                    </p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🐦</span>
                      <span className="text-sm font-medium">Twitter story</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      21 crédits → <strong>3 semaines</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Score de personnalisation */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              Bonus Personnalisation (100-150%)
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              <p className="text-sm text-gray-700">
                💡 Plus votre contenu est personnalisé, plus vous gagnez de crédits !
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-white rounded p-3">
                  <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">100%</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Copié-collé exact</p>
                    <p className="text-xs text-gray-600">Exemple LinkedIn post: 90 → <strong>90 crédits</strong></p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded p-3">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">125%</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Modifié ~25%</p>
                    <p className="text-xs text-gray-600">Exemple LinkedIn post: 90 → <strong>113 crédits</strong></p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded p-3">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">150%</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Ultra personnalisé</p>
                    <p className="text-xs text-gray-600">Exemple LinkedIn post: 90 → <strong className="text-green-700">135 crédits</strong></p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 italic">
                ℹ️ Notre algorithme compare votre contenu au template pour calculer le score automatiquement
              </p>
            </div>
          </section>

          {/* Section 5: Exemples concrets */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🎯 Exemples Concrets
            </h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2 text-sm">Utilisateur classique (1 welcomebook)</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✅ 150 crédits offerts → 150 jours</li>
                  <li>✅ 1 post LinkedIn personnalisé (125%) → +113 crédits</li>
                  <li>🎉 <strong>Total: 263 jours (~9 mois)</strong> avec 1 seul post !</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">Power user (3 welcomebooks)</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>⚡ Consommation accélérée: 1.25 crédit/jour (-20%)</li>
                  <li>✅ 150 crédits → 120 jours</li>
                  <li>✅ 2 posts LinkedIn (125%) → +226 crédits → +181 jours</li>
                  <li>🎉 <strong>Total: 301 jours (~10 mois)</strong> avec 2 posts</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2 text-sm">Stratégie article de blog</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✅ 1 article blog ultra perso (150%)</li>
                  <li>💎 180 crédits × 1.5 = <strong className="text-purple-700">270 crédits</strong></li>
                  <li>🎉 <strong>9 mois d'utilisation</strong> avec 1 seul article !</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Stratégie recommandée */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">💡 Stratégie Pour Tenir 1 An</h3>
            <p className="text-sm mb-3 text-indigo-100">
              Pour 1 welcomebook, voici quelques options simples :
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">🔵</span>
                <span>1 post LinkedIn perso par trimestre (4 × 113 = 452 crédits)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">✍️</span>
                <span>1 article blog perso par semestre (2 × 270 = 540 crédits)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">⚡</span>
                <span>12 stories LinkedIn (12 × 38 = 456 crédits)</span>
              </li>
            </ul>
            <p className="text-xs mt-3 text-indigo-100 italic">
              Objectif : Partager votre expérience naturellement, pas spammer 🙏
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
