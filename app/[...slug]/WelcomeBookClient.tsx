'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Plus, Sparkles, Heart } from 'lucide-react'
import { type Locale, locales, defaultLocale } from '@/i18n/request'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TipCard from '@/components/TipCard'
import TipModal from '@/components/TipModal'
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
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useFavorites } from '@/hooks/useFavorites'
import { ClientWithDetails, TipWithDetails, Category } from '@/types'
import { reorderTips } from '@/lib/actions/reorder'
import { Stats } from '@/lib/badge-detector'

// Dynamic import pour InteractiveMap (évite erreur SSR avec Leaflet)
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-500">Chargement de la carte...</p>
    </div>
  ),
})

interface WelcomeBookClientProps {
  client: ClientWithDetails
  isOwner: boolean
}

// Helper pour calculer les stats du client
function calculateStats(client: ClientWithDetails): Stats {
  const totalTips = client.tips.length
  const totalMedia = client.tips.reduce((sum, tip) => sum + (tip.media?.length || 0), 0)
  const totalCategories = new Set(client.tips.map(tip => tip.category?.id).filter(Boolean)).size
  const hasSecureSection = !!client.secure_section

  return {
    totalTips,
    totalMedia,
    totalCategories,
    hasSecureSection
  }
}

// Composant pour les boutons de filtre de catégories avec traduction
function CategoryFilterButton({
  category,
  isSelected,
  onClick,
  themeColor,
  locale
}: {
  category: Category
  isSelected: boolean
  onClick: () => void
  themeColor: string
  locale: Locale
}) {
  const { translated: categoryName } = useClientTranslation(
    category.name,
    'fr',
    locale
  )

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold transition whitespace-nowrap text-sm sm:text-base ${
        isSelected
          ? 'text-white'
          : 'bg-white text-gray-800 hover:bg-gray-100 active:scale-95'
      }`}
      style={isSelected ? { backgroundColor: themeColor } : undefined}
    >
      <span>{categoryName}</span>
    </button>
  )
}

export default function WelcomeBookClient({ client: initialClient, isOwner }: WelcomeBookClientProps) {
  const router = useRouter()
  const { user, login, logout } = useDevAuth()
  useServiceWorker() // Enregistrer le service worker pour la PWA

  // État local pour optimistic updates
  const [tips, setTips] = useState<TipWithDetails[]>(initialClient.tips)
  const [categories, setCategories] = useState<Category[]>(initialClient.categories)

  // 🔴 Hook pour gérer les favoris via localStorage
  const { favorites, toggleFavorite, isFavorite, favoritesCount } = useFavorites(initialClient.slug)

  // Recréer l'objet client avec les tips/categories de l'état local
  const client: ClientWithDetails = {
    ...initialClient,
    tips,
    categories,
  }

  const [selectedTip, setSelectedTip] = useState<TipWithDetails | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
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

  // 🔐 Activer automatiquement le mode édition quand le gestionnaire propriétaire est connecté
  useEffect(() => {
    if (user && isOwner) {
      console.log('[EDIT MODE] Gestionnaire propriétaire détecté, activation du mode édition')
      setEditMode(true)
    } else if (!user) {
      console.log('[EDIT MODE] Aucun utilisateur connecté, désactivation du mode édition')
      setEditMode(false)
    }
  }, [user, isOwner])

  // Mode édition actif UNIQUEMENT si l'utilisateur est le propriétaire
  const isEditMode = !!(user && editMode && isOwner)

  // Grouper les conseils par catégorie (mémorisé pour stabilité des refs)
  const tipsByCategory = useMemo(() => {
    return client.categories.reduce((acc, category) => {
      const categoryTips = client.tips.filter((tip) => tip.category_id === category.id)
      if (categoryTips.length > 0) {
        acc[category.id] = {
          category,
          tips: categoryTips,
        }
      }
      return acc
    }, {} as Record<string, { category: Category; tips: TipWithDetails[] }>)
  }, [client.categories, client.tips])

  // Préparer les données pour le wrapper draggable
  const categoriesData = useMemo(() => Object.values(tipsByCategory), [tipsByCategory])

  // ====== OPTIMISTIC UPDATE HANDLERS ======

  // Handler pour réorganiser les tips (optimistic)
  const handleTipsReorder = async (categoryId: string, tipIds: string[]) => {
    // Sauvegarder l'ancien état pour rollback
    const oldTips = [...tips]

    // Mise à jour INSTANTANÉE de l'ordre
    const reorderedTips = tipIds.map((id, index) => {
      const tip = tips.find((t) => t.id === id)
      if (!tip) return null
      // Créer un nouveau tip avec l'ordre mis à jour (type-safe)
      const updatedTip: TipWithDetails = { ...tip, order: index }
      return updatedTip
    }).filter((tip): tip is TipWithDetails => tip !== null)

    // Garder les tips des autres catégories inchangés
    const otherTips = tips.filter((t) => t.category_id !== categoryId)
    setTips([...otherTips, ...reorderedTips])

    try {
      // Appel serveur en arrière-plan
      const result = await reorderTips(categoryId, tipIds)
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      // Rollback en cas d'erreur
      console.error('[REORDER TIPS] Erreur:', error)
      setTips(oldTips)
    }
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

  // Handler pour exécuter la suppression après le décompte (optimistic)
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

    // Sauvegarder pour rollback
    const deletedTip = tips.find((t) => t.id === deletingTip.id)

    // 3. Mise à jour INSTANTANÉE de l'UI
    setTips((prev) => prev.filter((t) => t.id !== deletingTip.id))
    setShowDeleteToast(false)
    setDeletingTip(null)

    try {
      // 4. Supprimer en DB (médias + storage en arrière-plan)
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
              filesToDelete.push(`${initialClient.slug}/${fileName}`)
            }
          }
          if (media.thumbnail_url) {
            const thumbParts = media.thumbnail_url.split('/')
            const thumbName = thumbParts[thumbParts.length - 1]
            if (thumbName) {
              filesToDelete.push(`${initialClient.slug}/${thumbName}`)
            }
          }
        })

        if (filesToDelete.length > 0) {
          await supabase.storage.from('media').remove(filesToDelete)
        }
      }

      // Supprimer le tip (cascade vers tip_media)
      await (supabase.from('tips') as any).delete().eq('id', deletingTip.id)

      console.log('[DELETE] Tip supprimé avec succès')
    } catch (error) {
      // Rollback en cas d'erreur
      console.error('[DELETE] Erreur:', error)
      if (deletedTip) {
        setTips((prev) => [...prev, deletedTip])
      }
    }
  }

  // Catégories ayant au moins un conseil (pour le filtre)
  const categoriesWithTips = client.categories.filter(
    (category) => client.tips.some((tip) => tip.category_id === category.id)
  )

  // Conseils sans catégorie
  const uncategorizedTips = client.tips.filter((tip) => !tip.category_id)

  // Filtrer les conseils selon la catégorie sélectionnée ET les favoris
  const filteredTips = useMemo(() => {
    let tips = client.tips

    // Filtre par catégorie
    if (selectedCategory) {
      tips = tips.filter((tip) => tip.category_id === selectedCategory)
    }

    // Filtre par favoris
    if (showFavoritesOnly) {
      tips = tips.filter((tip) => isFavorite(tip.id))
    }

    return tips
  }, [client.tips, selectedCategory, showFavoritesOnly, isFavorite])

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

      <Header
        client={client}
        isEditMode={isEditMode}
        isOwner={!!(user && isOwner)}
        onEdit={() => setShowCustomizationMenu(true)}
        hasSecureSection={!!client.secure_section}
        locale={locale}
        onLocaleChange={handleLocaleChange}
        onAddTip={() => setShowAddTipModal(true)}
        onSmartFill={() => setShowSmartFillModal(true)}
        onToggleEditMode={() => setEditMode(!editMode)}
        onLogout={async () => {
          await logout()
          setEditMode(false)
        }}
      />

      <main className="flex-1 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          {/* Filtres de catégorie - Masqué si aucun conseil */}
          {client.tips.length > 0 && categoriesWithTips.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide px-4 -mx-4">
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    setShowFavoritesOnly(false)
                  }}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold transition whitespace-nowrap text-sm sm:text-base ${
                    selectedCategory === null && !showFavoritesOnly
                      ? 'text-white'
                      : 'bg-white text-gray-800 hover:bg-gray-100 active:scale-95'
                  }`}
                  style={selectedCategory === null && !showFavoritesOnly ? { backgroundColor: themeColor } : undefined}
                >
                  Tous
                </button>
                {favoritesCount > 0 && (
                  <button
                    onClick={() => {
                      setShowFavoritesOnly(!showFavoritesOnly)
                      setSelectedCategory(null)
                    }}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold transition whitespace-nowrap text-sm sm:text-base ${
                      showFavoritesOnly
                        ? 'text-white'
                        : 'bg-white text-gray-800 hover:bg-gray-100 active:scale-95'
                    }`}
                    style={showFavoritesOnly ? { backgroundColor: themeColor } : undefined}
                  >
                    <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-white' : 'fill-red-500 text-red-500'}`} />
                    <span>Favoris ({favoritesCount})</span>
                  </button>
                )}
                {categoriesWithTips.map((category) => (
                  <CategoryFilterButton
                    key={category.id}
                    category={category}
                    isSelected={selectedCategory === category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setShowFavoritesOnly(false)
                    }}
                    themeColor={themeColor}
                    locale={locale}
                  />
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
                    isFavorite={isFavorite}
                    onToggleFavorite={toggleFavorite}
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
                            isFavorite={isFavorite(tip.id)}
                            onToggleFavorite={() => toggleFavorite(tip.id)}
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
                        isFavorite={isFavorite(tip.id)}
                        onToggleFavorite={() => toggleFavorite(tip.id)}
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

      <Footer
        client={client}
        isEditMode={isEditMode}
        onEdit={() => setShowCustomizationMenu(true)}
        locale={locale}
        onManagerLogin={() => setShowLoginModal(true)}
      />

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
        onSuccess={(newTip) => {
          // Optimistic update : ajouter le tip à l'état local
          if (newTip) {
            setTips((prev) => [...prev, newTip])
          }
          setShowAddTipModal(false)
          setSelectedCategory(null)
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
        onSuccess={(newTips) => {
          // Optimistic update : ajouter les nouveaux tips à l'état local
          if (newTips && newTips.length > 0) {
            setTips((prev) => [...prev, ...newTips])
          }
          setShowSmartFillModal(false)
          setSelectedCategory(null)
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
        onSuccess={(updatedTip) => {
          // Optimistic update : mettre à jour le tip dans l'état local
          if (updatedTip) {
            setTips((prev) => prev.map((t) => (t.id === updatedTip.id ? updatedTip : t)))
          }
          setEditingTip(null)
          setSelectedCategory(null)
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
          // Le CustomizationMenu modifie le client (background, header, etc.)
          // Ces changements ne sont pas dans l'état local, donc on doit refresh
          router.refresh()
        }}
        client={client}
      />
      </div>
    </>
  )
}
