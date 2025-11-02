'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Plus, LogOut, Palette, Sparkles } from 'lucide-react'
import { type Locale, locales, defaultLocale } from '@/i18n/request'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TipCard from '@/components/TipCard'
import TipModal from '@/components/TipModal'
import InteractiveMap from '@/components/InteractiveMap'
import DevLoginModal from '@/components/DevLoginModal'
import AddTipModal from '@/components/AddTipModal'
import EditTipModal from '@/components/EditTipModal'
import DeleteToast from '@/components/DeleteToast'
import CustomizationMenu from '@/components/CustomizationMenu'
import DraggableCategoriesWrapper from '@/components/DraggableCategoriesWrapper'
import SmartFillModal from '@/components/SmartFillModal'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { useDevAuth } from '@/hooks/useDevAuth'
import { useServiceWorker } from '@/hooks/useServiceWorker'
import { ClientWithDetails, TipWithDetails, Category } from '@/types'
import { reorderTips } from '@/lib/actions/reorder'
import { Stats } from '@/lib/badge-detector'

interface WelcomeBookClientProps {
  client: ClientWithDetails
  isOwner: boolean
}

// Helper pour calculer les stats du client
function calculateStats(client: ClientWithDetails): Stats {
  const totalTips = client.tips.length
  const totalMedia = client.tips.reduce((sum, tip) => sum + (tip.media?.length || 0), 0)
  const totalCategories = new Set(client.tips.map(tip => tip.category_id).filter(Boolean)).size
  const hasSecureSection = !!client.secure_section
  const tipsWithTranslations = client.tips.filter(tip => {
    return !!(
      tip.title_en || tip.title_es || tip.title_nl || tip.title_de || tip.title_it || tip.title_pt ||
      tip.comment_en || tip.comment_es || tip.comment_nl || tip.comment_de || tip.comment_it || tip.comment_pt
    )
  }).length

  return {
    totalTips,
    totalMedia,
    totalCategories,
    hasSecureSection,
    tipsWithTranslations
  }
}

export default function WelcomeBookClient({ client, isOwner }: WelcomeBookClientProps) {
  const router = useRouter()
  const { user, login, logout } = useDevAuth()
  useServiceWorker() // Enregistrer le service worker pour la PWA
  const [selectedTip, setSelectedTip] = useState<TipWithDetails | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAddTipModal, setShowAddTipModal] = useState(false)
  const [showSmartFillModal, setShowSmartFillModal] = useState(false)
  const [showCustomizationMenu, setShowCustomizationMenu] = useState(false)
  const [editingTip, setEditingTip] = useState<TipWithDetails | null>(null)
  const [deletingTip, setDeletingTip] = useState<{ id: string; title: string } | null>(null)
  const [showDeleteToast, setShowDeleteToast] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // 🌍 NOUVEAU : Détection automatique de la langue du navigateur
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  useEffect(() => {
    // Clé localStorage pour persister le choix de langue de l'utilisateur
    const storageKey = `welcomeapp_lang_${client.slug}`

    // 1. Vérifier si l'utilisateur a déjà choisi une langue pour ce welcomeapp
    const savedLocale = localStorage.getItem(storageKey)
    if (savedLocale && locales.includes(savedLocale as Locale)) {
      console.log('[LOCALE] Langue sauvegardée trouvée:', savedLocale)
      setLocale(savedLocale as Locale)
      return
    }

    // 2. Détecter la langue du navigateur
    const browserLang = navigator.language.split('-')[0] // 'en-US' → 'en'
    console.log('[LOCALE] Langue du navigateur détectée:', browserLang)

    // 3. Vérifier si la langue détectée est supportée
    if (locales.includes(browserLang as Locale)) {
      console.log('[LOCALE] Langue supportée, utilisation de', browserLang)
      setLocale(browserLang as Locale)
      // Sauvegarder le choix automatique
      localStorage.setItem(storageKey, browserLang)
    } else {
      console.log('[LOCALE] Langue non supportée, fallback sur', defaultLocale)
      setLocale(defaultLocale)
    }
  }, [client.slug])

  // Fonction pour changer la langue manuellement (appelée depuis LanguageSelector)
  const handleLocaleChange = (newLocale: Locale) => {
    console.log('[LOCALE] Changement manuel vers:', newLocale)
    setLocale(newLocale)
    // Persister le choix de l'utilisateur
    const storageKey = `welcomeapp_lang_${client.slug}`
    localStorage.setItem(storageKey, newLocale)
  }

  // Mode édition actif UNIQUEMENT si l'utilisateur est le propriétaire
  const isEditMode = !!(user && editMode && isOwner)

  // Grouper les conseils par catégorie
  const tipsByCategory = client.categories.reduce((acc, category) => {
    const categoryTips = client.tips.filter((tip) => tip.category_id === category.id)
    if (categoryTips.length > 0) {
      acc[category.id] = {
        category,
        tips: categoryTips,
      }
    }
    return acc
  }, {} as Record<string, { category: Category; tips: TipWithDetails[] }>)

  // Préparer les données pour le wrapper draggable
  const categoriesData = Object.values(tipsByCategory)

  // Handler pour réorganiser les tips
  const handleTipsReorder = async (categoryId: string, tipIds: string[]) => {
    await reorderTips(categoryId, tipIds)
    router.refresh()
  }

  // Handler pour démarrer la suppression (affiche le toast)
  const handleDeleteRequest = (tip: { id: string; title: string }) => {
    console.log('[DELETE] 🗑️ Demande de suppression:', tip.title)
    setDeletingTip(tip)
    setShowDeleteToast(true)
  }

  // Handler pour annuler la suppression
  const handleUndoDelete = () => {
    console.log('[DELETE] ↩️ Annulation')
    setShowDeleteToast(false)
    setDeletingTip(null)
  }

  // Handler pour exécuter la suppression après le décompte
  const handleDeleteComplete = async () => {
    if (!deletingTip) return

    console.log('[DELETE] 💥 Animation poof...')

    // 1. Animer la card avec poof
    const cardElement = document.querySelector(`[data-tip-id="${deletingTip.id}"]`)
    if (cardElement) {
      cardElement.classList.add('animate-poof')
    }

    // 2. Attendre la fin de l'animation
    await new Promise(resolve => setTimeout(resolve, 500))

    // 3. Supprimer en DB (via DeleteConfirmDialog logic)
    const supabase = await import('@/lib/supabase/client').then(m => m.createClient())

    // Récupérer les médias pour les supprimer du storage
    const { data: mediaData } = await (supabase
      .from('tip_media') as any)
      .select('url, thumbnail_url')
      .eq('tip_id', deletingTip.id)

    // Supprimer les fichiers du storage
    if (mediaData && mediaData.length > 0) {
      const filesToDelete: string[] = []

      mediaData.forEach((media: any) => {
        if (media.url) {
          const urlParts = media.url.split('/')
          const fileName = urlParts[urlParts.length - 1]
          if (fileName) {
            filesToDelete.push(`${client.slug}/${fileName}`)
          }
        }
        if (media.thumbnail_url) {
          const thumbParts = media.thumbnail_url.split('/')
          const thumbName = thumbParts[thumbParts.length - 1]
          if (thumbName) {
            filesToDelete.push(`${client.slug}/${thumbName}`)
          }
        }
      })

      if (filesToDelete.length > 0) {
        await supabase.storage.from('media').remove(filesToDelete)
      }
    }

    // Supprimer le tip (cascade vers tip_media)
    await (supabase.from('tips') as any).delete().eq('id', deletingTip.id)

    // 4. Nettoyer les states et refresh
    setShowDeleteToast(false)
    setDeletingTip(null)
    router.refresh()
  }

  // Catégories ayant au moins un conseil (pour le filtre)
  const categoriesWithTips = client.categories.filter(
    (category) => client.tips.some((tip) => tip.category_id === category.id)
  )

  // Conseils sans catégorie
  const uncategorizedTips = client.tips.filter((tip) => !tip.category_id)

  // Filtrer les conseils selon la catégorie sélectionnée
  const filteredTips = selectedCategory
    ? client.tips.filter((tip) => tip.category_id === selectedCategory)
    : client.tips

  // Couleur du thème (utilisée pour les boutons, liens, etc.)
  const themeColor = client.header_color || '#4F46E5'

  return (
    <>
      {/* Background fixe qui ne bouge jamais et couvre toute la hauteur mobile */}
      <div
        className="bg-fixed-mobile bg-size-responsive -z-20"
        style={{
          backgroundImage: client.background_image ? `url(${client.background_image})` : undefined,
          backgroundColor: client.background_image ? undefined : '#f3f4f6',
          backgroundPosition: client.mobile_background_position || '50% 50%',
          backgroundRepeat: 'no-repeat',
        } as React.CSSProperties}
      />

      {/* Overlay pour améliorer la lisibilité selon l'effet choisi */}
      {client.background_image && (
        <div
          className="bg-fixed-mobile -z-10"
          style={{
            backgroundColor: client.background_effect === 'light'
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(0, 0, 0, 0.4)',
            backdropFilter: client.background_effect === 'blur' ? 'blur(8px)' : undefined,
            WebkitBackdropFilter: client.background_effect === 'blur' ? 'blur(8px)' : undefined,
          } as React.CSSProperties}
        />
      )}

      <div
        className="min-h-screen flex flex-col relative"
        style={{
          '--theme-color': themeColor,
        } as React.CSSProperties}
      >

      {/* Bouton de connexion / mode édition */}
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-[60] flex gap-1.5 sm:gap-3 flex-wrap justify-end max-w-[calc(100vw-1rem)]">
        {!user ? (
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-white hover:bg-gray-100 text-gray-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg font-semibold transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
          >
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Connexion gestionnaire</span>
            <span className="sm:hidden">Connexion</span>
          </button>
        ) : isOwner ? (
          <>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg font-semibold transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base ${
                editMode
                  ? 'text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
              style={editMode ? { backgroundColor: themeColor } : undefined}
            >
              <span className="hidden sm:inline">{editMode ? 'Quitter l\'édition' : 'Mode édition'}</span>
              <span className="sm:hidden">{editMode ? 'Quitter' : 'Éditer'}</span>
            </button>
            {editMode && (
              <button
                onClick={() => setShowCustomizationMenu(true)}
                className="bg-white hover:bg-gray-100 text-gray-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg font-semibold transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
              >
                <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Personnaliser</span>
              </button>
            )}
            <button
              onClick={async () => {
                await logout()
                setEditMode(false)
              }}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg font-semibold transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </>
        ) : (
          <button
            onClick={async () => {
              await logout()
              router.refresh()
            }}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg font-semibold transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        )}
      </div>

      {/* Boutons flottants pour ajouter un conseil */}
      {isEditMode && (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[60] flex flex-col gap-4">
          {/* Bouton Pré-remplissage intelligent */}
          <button
            onClick={() => setShowSmartFillModal(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 active:scale-95 group flex items-center gap-3 pr-5 pl-4 py-4 animate-pulse hover:animate-none"
            title="Pré-remplissage intelligent"
          >
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
            <span className="hidden sm:inline font-bold text-base whitespace-nowrap">
              Remplissage auto
            </span>
          </button>

          {/* Bouton Ajouter un conseil */}
          <button
            onClick={() => setShowAddTipModal(true)}
            className="text-white rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 pr-5 pl-4 py-4"
            style={{ backgroundColor: themeColor, boxShadow: `0 20px 25px -5px ${themeColor}40, 0 8px 10px -6px ${themeColor}40` }}
            title="Ajouter un conseil"
          >
            <Plus className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
            <span className="hidden sm:inline font-bold text-base whitespace-nowrap">
              Ajouter
            </span>
          </button>
        </div>
      )}

      <Header client={client} isEditMode={isEditMode} hasSecureSection={!!client.secure_section} locale={locale} onLocaleChange={handleLocaleChange} />

      <main className="flex-1 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          {/* Filtres de catégorie - Masqué si aucun conseil */}
          {client.tips.length > 0 && categoriesWithTips.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide px-4 -mx-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold transition whitespace-nowrap text-sm sm:text-base ${
                    selectedCategory === null
                      ? 'text-white'
                      : 'bg-white text-gray-800 hover:bg-gray-100 active:scale-95'
                  }`}
                  style={selectedCategory === null ? { backgroundColor: themeColor } : undefined}
                >
                  Tous
                </button>
                {categoriesWithTips.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold transition whitespace-nowrap text-sm sm:text-base ${
                      selectedCategory === category.id
                        ? 'text-white'
                        : 'bg-white text-gray-800 hover:bg-gray-100 active:scale-95'
                    }`}
                    style={selectedCategory === category.id ? { backgroundColor: themeColor } : undefined}
                  >
                    {category.icon && <span className="text-base sm:text-lg">{category.icon}</span>}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* État vide : aucun conseil */}
          {client.tips.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-12">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    Bienvenue ! 👋
                  </h2>
                  <p className="text-gray-700 text-lg mb-6">
                    {isEditMode
                      ? "Votre welcomeapp est prêt à être rempli. Commencez par ajouter vos premiers conseils !"
                      : "Ce welcomeapp n'a pas encore de conseils. Si vous êtes le propriétaire, connectez-vous pour commencer à le personnaliser et offrir une expérience unique à vos voyageurs !"
                    }
                  </p>
                  {isEditMode && (
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowSmartFillModal(true)}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Sparkles className="w-5 h-5" />
                        Remplissage automatique
                      </button>
                      <button
                        onClick={() => setShowAddTipModal(true)}
                        className="w-full bg-white text-gray-800 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Ajouter manuellement
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Sections de conseils par catégorie */}
              {selectedCategory === null ? (
                <>
                  <DraggableCategoriesWrapper
                    categoriesData={categoriesData}
                    isEditMode={isEditMode}
                    onTipClick={(tip) => setSelectedTip(tip)}
                    onTipEdit={(tip) => setEditingTip(tip)}
                    onTipDelete={(tip) => handleDeleteRequest(tip)}
                    onTipsReorder={handleTipsReorder}
                    themeColor={themeColor}
                    locale={locale}
                  />

                  {uncategorizedTips.length > 0 && (
                    <section className="mb-8 sm:mb-10 md:mb-12">
                      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg px-1">
                        Autres conseils
                      </h2>
                      <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide px-1 -mx-1">
                        {uncategorizedTips.map((tip) => (
                          <TipCard
                            key={tip.id}
                            tip={tip}
                            onClick={() => setSelectedTip(tip)}
                            isEditMode={isEditMode}
                            onEdit={() => setEditingTip(tip)}
                            onDelete={() => handleDeleteRequest({ id: tip.id, title: tip.title })}
                            themeColor={themeColor}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <section className="mb-8 sm:mb-10 md:mb-12">
                  <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide px-1 -mx-1">
                    {filteredTips.map((tip) => (
                      <TipCard
                        key={tip.id}
                        tip={tip}
                        onClick={() => setSelectedTip(tip)}
                        isEditMode={isEditMode}
                        onEdit={() => setEditingTip(tip)}
                        onDelete={() => handleDeleteRequest({ id: tip.id, title: tip.title })}
                        themeColor={themeColor}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Carte interactive - Masquée si aucun conseil */}
          {client.tips.length > 0 && (
            <section className="mb-8 sm:mb-10 md:mb-12 relative z-0">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg px-1">
                Carte des lieux
              </h2>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[300px] sm:h-[400px] md:h-[500px] relative z-0">
                <InteractiveMap
                  tips={filteredTips.filter((tip) => tip.coordinates_parsed)}
                  onMarkerClick={(tip) => setSelectedTip(tip)}
                  themeColor={themeColor}
                  clientId={client.id}
                />
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer client={client} isEditMode={isEditMode} locale={locale} />

      {/* PWA Install Prompt - Uniquement pour les visiteurs */}
      {!isEditMode && <PWAInstallPrompt clientName={client.name} />}

      {/* Modales */}
      <DevLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={async (email, password) => {
          await login(email, password)
          setEditMode(true)
        }}
      />

      <TipModal
        tip={selectedTip}
        isOpen={!!selectedTip}
        onClose={() => setSelectedTip(null)}
        themeColor={themeColor}
        locale={locale}
      />

      <AddTipModal
        isOpen={showAddTipModal}
        onClose={() => setShowAddTipModal(false)}
        onSuccess={() => {
          setShowAddTipModal(false)
          setSelectedCategory(null) // Réinitialiser le filtre pour afficher toutes les catégories
          router.refresh()
        }}
        clientId={client.id}
        categories={client.categories}
        stats={calculateStats(client)}
        hasCustomBackground={
          !!client.background_image &&
          !client.background_image.startsWith('/backgrounds/')
        }
      />

      <SmartFillModal
        isOpen={showSmartFillModal}
        onClose={() => setShowSmartFillModal(false)}
        onSuccess={() => {
          setShowSmartFillModal(false)
          setSelectedCategory(null) // Réinitialiser le filtre pour afficher toutes les catégories
          router.refresh()
        }}
        clientId={client.id}
        propertyAddress={client.secure_section?.property_address || undefined}
        propertyLat={client.secure_section?.property_coordinates_parsed?.lat || undefined}
        propertyLng={client.secure_section?.property_coordinates_parsed?.lng || undefined}
        stats={calculateStats(client)}
        hasCustomBackground={
          !!client.background_image &&
          !client.background_image.startsWith('/backgrounds/')
        }
      />

      <EditTipModal
        isOpen={!!editingTip}
        onClose={() => setEditingTip(null)}
        onSuccess={() => {
          setEditingTip(null)
          setSelectedCategory(null) // Réinitialiser le filtre pour afficher toutes les catégories
          router.refresh()
        }}
        tip={editingTip}
        categories={client.categories}
      />

      <DeleteToast
        show={showDeleteToast}
        tipTitle={deletingTip?.title || ''}
        countdown={3}
        onUndo={handleUndoDelete}
        onComplete={handleDeleteComplete}
      />

      <CustomizationMenu
        isOpen={showCustomizationMenu}
        onClose={() => setShowCustomizationMenu(false)}
        onSuccess={() => {
          setShowCustomizationMenu(false)
          router.refresh()
        }}
        client={client}
      />
      </div>
    </>
  )
}
