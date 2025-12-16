'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Sparkles, MapPin, CheckCircle2, ArrowRight, Home, Palette, FileImage, Droplets } from 'lucide-react'
import SmartFillModal from './SmartFillModal'
import BackgroundSelector from './BackgroundSelector'
import { Client } from '@/types'
import { updateClientBackground, updateClientHeaderColor } from '@/lib/actions/client'
import { getDefaultBackground } from '@/lib/backgrounds'
import { GoogleAdsConversionTracker } from '@/hooks/useGoogleAdsConversion'
import { ColorPicker, ColorPickerTrigger, ColorPickerContent, ColorPickerArea, ColorPickerHueSlider, ColorPickerSwatch } from '@/components/ui/color-picker'

interface WelcomeOnboardingProps {
  client: Client
  user: User
}

type OnboardingStep = 'welcome' | 'background' | 'colors' | 'smart-fill' | 'done'

export default function WelcomeOnboarding({ client, user }: WelcomeOnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [showSmartFillModal, setShowSmartFillModal] = useState(false)
  const [hasUsedSmartFill, setHasUsedSmartFill] = useState(false)
  const [selectedBackground, setSelectedBackground] = useState<string>(
    client.background_image || getDefaultBackground().path
  )
  const [selectedColor, setSelectedColor] = useState<string>(client.header_color || '#6366f1')
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleSkipStep = async (nextStep: OnboardingStep) => {
    await saveChanges()
    setStep(nextStep)
  }

  const handleNextStep = async (nextStep: OnboardingStep) => {
    await saveChanges()
    setStep(nextStep)
  }

  const handleSmartFillSuccess = async () => {
    await saveChanges()
    setHasUsedSmartFill(true)
    setShowSmartFillModal(false)
    setStep('done')
  }

  const handleStartSmartFill = async () => {
    await saveChanges()
    setShowSmartFillModal(true)
  }

  const saveChanges = async () => {
    setIsSaving(true)
    try {
      // Sauvegarder le background si modifié
      if (selectedBackground !== client.background_image) {
        console.log('[ONBOARDING] Sauvegarde du background:', selectedBackground)
        const result = await updateClientBackground(client.id, selectedBackground)
        if (!result.success) {
          console.error('[ONBOARDING] Erreur sauvegarde background:', result.error)
        } else {
          console.log('[ONBOARDING] Background sauvegardé ✅')
        }
      }

      // Sauvegarder la couleur du header si modifiée
      if (selectedColor !== client.header_color) {
        console.log('[ONBOARDING] Sauvegarde de la couleur:', selectedColor)
        const result = await updateClientHeaderColor(client.id, selectedColor)
        if (!result.success) {
          console.error('[ONBOARDING] Erreur sauvegarde couleur:', result.error)
        } else {
          console.log('[ONBOARDING] Couleur sauvegardée ✅')
        }
      }
    } catch (error) {
      console.error('[ONBOARDING] Erreur catch:', error)
    } finally {
      setIsSaving(false)
    }
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
      {/* Tracking Google Ads - Conversion "Lead" quand welcomebook créé */}
      <GoogleAdsConversionTracker email={user.email} />

      <div className="bg-fixed-mobile bg-gradient-to-br from-indigo-500 to-purple-600 -z-10" />
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 md:p-12">

          {/* Indicateur de progression */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full transition-colors ${step === 'welcome' ? 'bg-indigo-600' : 'bg-gray-300'}`} />
              <div className={`w-3 h-3 rounded-full transition-colors ${step === 'background' ? 'bg-indigo-600' : 'bg-gray-300'}`} />
              <div className={`w-3 h-3 rounded-full transition-colors ${step === 'colors' ? 'bg-indigo-600' : 'bg-gray-300'}`} />
              <div className={`w-3 h-3 rounded-full transition-colors ${step === 'smart-fill' ? 'bg-indigo-600' : 'bg-gray-300'}`} />
              <div className={`w-3 h-3 rounded-full transition-colors ${step === 'done' ? 'bg-indigo-600' : 'bg-gray-300'}`} />
            </div>
            <p className="text-center text-sm text-gray-600">
              {step === 'welcome' && 'Étape 1/5 - Bienvenue'}
              {step === 'background' && 'Étape 2/5 - Arrière-plan'}
              {step === 'colors' && 'Étape 3/5 - Couleurs'}
              {step === 'smart-fill' && 'Étape 4/5 - Remplissage automatique'}
              {step === 'done' && 'Étape 5/5 - Félicitations'}
            </p>
          </div>

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
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Nous allons configurer ensemble votre WelcomeApp :
                </h2>
                <div className="space-y-2 text-base text-gray-700">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-5 h-5 text-indigo-600" />
                    <span>Choisir un arrière-plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-600" />
                    <span>Personnaliser les couleurs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-600" />
                    <span>Remplir automatiquement avec des lieux</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => handleSkipStep('done')}
                  disabled={isSaving}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Sauvegarde...' : 'Passer toutes les étapes'}
                </button>
                <button
                  onClick={() => handleNextStep('background')}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Sauvegarde...' : "Commencer la configuration"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                💡 Vous pourrez tout personnaliser plus tard dans les paramètres
              </p>
            </div>
          )}

          {/* Étape 2 : Background */}
          {step === 'background' && (
            <div className="text-center space-y-6">
              <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mb-4">
                <FileImage className="w-16 h-16 text-white" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Choisissez un arrière-plan
              </h1>

              <p className="text-xl text-gray-700 mb-6">
                Sélectionnez une image parmi notre galerie ou téléchargez la vôtre
              </p>

              {/* Sélection du background */}
              <div className="mt-8">
                <BackgroundSelector
                  selectedBackground={selectedBackground}
                  onSelectBackground={setSelectedBackground}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => handleSkipStep('colors')}
                  disabled={isSaving}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Sauvegarde...' : 'Passer cette étape'}
                </button>
                <button
                  onClick={() => handleNextStep('colors')}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileImage className="w-5 h-5" />
                  {isSaving ? 'Sauvegarde...' : 'Suivant : Couleurs'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 : Colors */}
          {step === 'colors' && (
            <div className="text-center space-y-6">
              <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
                <Palette className="w-16 h-16 text-white" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Personnalisez les couleurs
              </h1>

              <p className="text-xl text-gray-700 mb-6">
                Choisissez la couleur principale de votre WelcomeApp
              </p>

              {/* Color Picker */}
              <div className="flex flex-col items-center gap-6 p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                <div className="flex items-center gap-4">
                  <div
                    className="w-24 h-24 rounded-2xl shadow-lg border-4 border-white transition-all"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Couleur sélectionnée</p>
                    <p className="text-2xl font-bold" style={{ color: selectedColor }}>
                      {selectedColor}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Cette couleur sera utilisée pour<br />le header et les boutons
                    </p>
                  </div>
                </div>

                <ColorPicker value={selectedColor} onValueChange={setSelectedColor}>
                  <ColorPickerTrigger asChild>
                    <button className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 shadow">
                      <Droplets className="w-5 h-5" />
                      Choisir une couleur
                    </button>
                  </ColorPickerTrigger>
                  <ColorPickerContent>
                    <ColorPickerArea />
                    <ColorPickerHueSlider />
                    <div className="flex items-center gap-3">
                      <ColorPickerSwatch />
                      <span className="text-sm font-medium text-gray-700">Aperçu</span>
                    </div>
                  </ColorPickerContent>
                </ColorPicker>

                <div className="grid grid-cols-5 gap-3 mt-2">
                  {['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#14b8a6'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-lg transition-all hover:scale-110 ${
                        selectedColor === color ? 'ring-4 ring-offset-2 ring-indigo-600 scale-110' : 'hover:ring-2 ring-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Couleur ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => handleSkipStep('smart-fill')}
                  disabled={isSaving}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Sauvegarde...' : 'Passer cette étape'}
                </button>
                <button
                  onClick={() => handleNextStep('smart-fill')}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Palette className="w-5 h-5" />
                  {isSaving ? 'Sauvegarde...' : 'Suivant : Remplissage auto'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 4 : Smart Fill */}
          {step === 'smart-fill' && (
            <div className="text-center space-y-6">
              <div className="inline-block p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
                <Sparkles className="w-16 h-16 text-white" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Remplissage automatique ✨
              </h1>

              <p className="text-xl text-gray-700 mb-6">
                Gagnez du temps ! Nous allons trouver les meilleurs lieux autour de votre logement
              </p>

              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                  Tout est déjà inclus :
                </h2>
                <div className="grid sm:grid-cols-2 gap-3 text-base text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Photos des lieux</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Horaires d'ouverture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Numéros de téléphone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Coordonnées GPS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Notes et avis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Sites web</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => handleSkipStep('done')}
                  disabled={isSaving}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Sauvegarde...' : 'Passer cette étape'}
                </button>
                <button
                  onClick={handleStartSmartFill}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-5 h-5" />
                  {isSaving ? 'Sauvegarde...' : 'Lancer le remplissage intelligent'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                💡 Vous pourrez toujours ajouter des lieux manuellement plus tard
              </p>
            </div>
          )}

          {/* Étape 5 : Done */}
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
                      <h3 className="font-semibold text-gray-900">Personnalisez davantage le design</h3>
                      <p className="text-sm text-gray-700">
                        Ajustez les effets, téléchargez votre propre arrière-plan, personnalisez le QR code
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
        stats={{
          totalTips: 0,
          totalMedia: 0,
          totalCategories: 0,
          hasSecureSection: false
        }}
        hasCustomBackground={false}
      />
    </>
  )
}
