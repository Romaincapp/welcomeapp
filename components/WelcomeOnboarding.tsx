'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Sparkles, MapPin, CheckCircle2, ArrowRight, Home, Palette } from 'lucide-react'
import SmartFillModal from './SmartFillModal'
import { Client } from '@/types'

interface WelcomeOnboardingProps {
  client: Client
  user: User
}

type OnboardingStep = 'welcome' | 'smart-fill' | 'customize' | 'done'

export default function WelcomeOnboarding({ client, user }: WelcomeOnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [showSmartFillModal, setShowSmartFillModal] = useState(false)
  const [hasUsedSmartFill, setHasUsedSmartFill] = useState(false)
  const router = useRouter()

  const handleSkipSmartFill = () => {
    setStep('customize')
  }

  const handleSmartFillSuccess = () => {
    setHasUsedSmartFill(true)
    setShowSmartFillModal(false)
    setStep('done')
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
    router.refresh()
  }

  const handleGoToWelcomeApp = () => {
    router.push(`/${client.slug}`)
  }

  return (
    <>
      <div className="bg-fixed-mobile bg-gradient-to-br from-indigo-500 to-purple-600 -z-10" />
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 md:p-12">
          {/* Étape 1 : Welcome */}
          {step === 'welcome' && (
            <div className="text-center space-y-6">
              <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4">
                <Sparkles className="w-16 h-16 text-white" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Bienvenue sur WelcomeApp ! 🎉
              </h1>

              <p className="text-xl text-gray-700 mb-6">
                Bonjour <strong>{user.email?.split('@')[0]}</strong> ! Votre WelcomeApp "<strong>{client.name}</strong>" a été créé avec succès.
              </p>

              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-1">Votre URL personnalisée :</p>
                <p className="text-lg font-bold text-indigo-600">
                  welcomeapp.be/{client.slug}
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-indigo-200 text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  Remplissage automatique ✨
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Donnez-nous l'adresse de votre logement et nous trouvons automatiquement les meilleurs lieux à proximité.
                </p>
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <p className="text-base font-semibold text-gray-900 mb-2">
                    Tout est déjà inclus : photos, horaires, téléphone, GPS et plus encore !
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={handleSkipSmartFill}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Passer cette étape
                </button>
                <button
                  onClick={() => {
                    setShowSmartFillModal(true)
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Lancer le remplissage intelligent
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                💡 Vous pourrez toujours ajouter des lieux manuellement plus tard
              </p>
            </div>
          )}

          {/* Étape 2 : Customize */}
          {step === 'customize' && (
            <div className="text-center space-y-6">
              <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
                <Palette className="w-16 h-16 text-white" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Personnalisez votre WelcomeApp
              </h1>

              <p className="text-xl text-gray-700 mb-6">
                Votre WelcomeApp est prêt ! Vous pouvez maintenant le personnaliser à votre image.
              </p>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 text-left space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Palette className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Personnalisation du design</h3>
                    <p className="text-sm text-gray-700">
                      Modifiez les couleurs, l'arrière-plan et le style de votre welcomeapp
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ajout de conseils</h3>
                    <p className="text-sm text-gray-700">
                      Ajoutez vos propres recommandations avec photos, horaires et infos pratiques
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Home className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Section sécurisée</h3>
                    <p className="text-sm text-gray-700">
                      Configurez une section protégée par code pour les infos sensibles (WiFi, adresse exacte, etc.)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={handleGoToDashboard}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Aller au Dashboard
                </button>
                <button
                  onClick={handleGoToWelcomeApp}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Palette className="w-5 h-5" />
                  Personnaliser mon WelcomeApp
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 : Done */}
          {step === 'done' && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Félicitations ! 🎉
              </h1>

              <p className="text-xl text-gray-700 mb-6">
                {hasUsedSmartFill
                  ? 'Votre WelcomeApp a été pré-rempli avec succès !'
                  : 'Votre WelcomeApp est prêt à être personnalisé !'}
              </p>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Prochaines étapes :
                </h2>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-indigo-600 border-2 border-indigo-200">
                      1
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Vérifiez et modifiez les conseils</h3>
                      <p className="text-sm text-gray-700">
                        {hasUsedSmartFill
                          ? 'Consultez les lieux importés et ajustez les informations si nécessaire'
                          : 'Ajoutez vos premiers conseils pour vos voyageurs'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-indigo-600 border-2 border-indigo-200">
                      2
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Personnalisez le design</h3>
                      <p className="text-sm text-gray-700">
                        Changez les couleurs, l'arrière-plan et le style de votre welcomeapp
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-indigo-600 border-2 border-indigo-200">
                      3
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Configurez la section sécurisée</h3>
                      <p className="text-sm text-gray-700">
                        Ajoutez les informations sensibles (WiFi, adresse exacte, instructions d'arrivée)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-indigo-600 border-2 border-indigo-200">
                      4
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Partagez avec vos clients</h3>
                      <p className="text-sm text-gray-700">
                        Récupérez le lien et le QR code pour les envoyer à vos voyageurs
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={handleGoToDashboard}
                  className="px-6 py-3 border-2 border-indigo-500 rounded-lg font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                >
                  Voir le Dashboard
                </button>
                <button
                  onClick={handleGoToWelcomeApp}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Voir mon WelcomeApp
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Smart Fill Modal */}
      <SmartFillModal
        isOpen={showSmartFillModal}
        onClose={() => setShowSmartFillModal(false)}
        onSuccess={handleSmartFillSuccess}
        clientId={client.id}
        propertyAddress={undefined}
        propertyLat={undefined}
        propertyLng={undefined}
      />
    </>
  )
}
