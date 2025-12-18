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
import CategoryModal from '@/components/CategoryModal'
import EditTipModal from '@/components/EditTipModal'
import DeleteToast from '@/components/DeleteToast'
import CustomizationMenu from '@/components/CustomizationMenu'
import SecureSectionEditModal from '@/components/SecureSectionEditModal'
import SecureSectionNotice from '@/components/SecureSectionNotice'
import SecureSectionModal from '@/components/SecureSectionModal'
import DraggableCategoriesWrapper from '@/components/DraggableCategoriesWrapper'
import CategoryFullViewModal from '@/components/CategoryFullViewModal'
import SmartFillModal from '@/components/SmartFillModal'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import WelcomeMessageModal from '@/components/WelcomeMessageModal'
import { useDevAuth } from '@/hooks/useDevAuth'
import { useServiceWorker } from '@/hooks/useServiceWorker'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useFavorites } from '@/hooks/useFavorites'
import { useAnalytics } from '@/hooks/useAnalytics'
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
          ? 'text-white shadow-lg'
          : 'bg-white text-gray-800 hover:bg-gray-100 active:scale-95 shadow-md ring-1 ring-gray-200'
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

  // 🔐 Calculer dynamiquement si l'utilisateur connecté est le propriétaire
  // La prop `isOwner` est calculée côté serveur au chargement initial, mais ne se met pas à jour
  // si l'utilisateur se connecte après (via "Espace gestionnaire"). On doit donc recalculer côté client.
  const isOwnerDynamic = !!(user && user.email === initialClient.email)

  // Vérification suspension de compte (uniquement pour visiteurs, pas pour le propriétaire connecté)
  const accountStatus = (initialClient as any).account_status
  if (!isOwner && !isOwnerDynamic && (accountStatus === 'suspended' || accountStatus === 'to_delete')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page temporairement indisponible
          </h1>
          <p className="text-gray-600 mb-6">
            Ce welcomebook n'est actuellement pas accessible. Veuillez contacter votre hôte pour plus d'informations.
          </p>
          <p className="text-sm text-gray-500">
            Si vous êtes le gestionnaire de ce welcomebook, reconnectez-vous pour réactiver votre compte.
          </p>
        </div>
      </div>
    )
  }

  // État local pour optimistic updates
  const [tips, setTips] = useState<TipWithDetails[]>(initialClient.tips)
  const [categories, setCategories] = useState<Category[]>(initialClient.categories)

  // État local pour la customisation (background, header, footer, message)
  const [customization, setCustomization] = useState({
    background_image: initialClient.background_image,
    background_color: initialClient.background_color,
    background_effect: initialClient.background_effect,
    mobile_background_position: initialClient.mobile_background_position,
    sync_background_with_header: initialClient.sync_background_with_header,
    sync_background_with_footer: initialClient.sync_background_with_footer,
    header_color: initialClient.header_color,
    header_text_color: initialClient.header_text_color,
    header_subtitle: initialClient.header_subtitle,
    footer_color: initialClient.footer_color,
    footer_text_color: initialClient.footer_text_color,
    footer_contact_email: initialClient.footer_contact_email,
    footer_contact_phone: initialClient.footer_contact_phone,
    footer_contact_website: initialClient.footer_contact_website,
    footer_contact_facebook: initialClient.footer_contact_facebook,
    footer_contact_instagram: initialClient.footer_contact_instagram,
    footer_custom_text: initialClient.footer_custom_text,
    ad_iframe_url: initialClient.ad_iframe_url,
    category_title_color: initialClient.category_title_color,
    welcome_message: initialClient.welcome_message,
    welcome_message_photo: initialClient.welcome_message_photo,
    name: initialClient.name,
  })

  // 🔴 Hook pour gérer les favoris via localStorage
  const { favorites, toggleFavorite, isFavorite, favoritesCount } = useFavorites(initialClient.slug)

  // 📊 Hook pour tracker les analytics visiteurs (désactive si propriétaire)
  // Utilise isOwner OU isOwnerDynamic pour désactiver le tracking si le propriétaire se connecte après
  const { trackView, trackClick, trackInstall, isReady: isAnalyticsReady } = useAnalytics(initialClient.slug, isOwner || isOwnerDynamic)

  // Recréer l'objet client avec les tips/categories et customization de l'état local
  const client: ClientWithDetails = {
    ...initialClient,
    ...customization,
    tips,
    categories,
  }

  const [selectedTip, setSelectedTip] = useState<TipWithDetails | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAddTipModal, setShowAddTipModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [showSmartFillModal, setShowSmartFillModal] = useState(false)
  const [showCustomizationMenu, setShowCustomizationMenu] = useState(false)
  const [customizationInitialTab, setCustomizationInitialTab] = useState<'background' | 'header' | 'footer' | 'message'>('background')
  const [showSecureSectionEditModal, setShowSecureSectionEditModal] = useState(false)
  const [showSecureSectionViewModal, setShowSecureSectionViewModal] = useState(false)
  const [categoryFullView, setCategoryFullView] = useState<{ category: Category; tips: TipWithDetails[] } | null>(null)
  const [editingTip, setEditingTip] = useState<TipWithDetails | null>(null)
  const [deletingTip, setDeletingTip] = useState<{ id: string; title: string } | null>(null)
  const [showDeleteToast, setShowDeleteToast] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // 🌍 NOUVEAU : Détection automatique de la langue du navigateur
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  // 📱 Écouter les messages du DeviceMockup parent (landing page)
  // - Scroll : drag ou molette
  // - Click : clic simulé sur élément
  // + Masquer la scrollbar si on est dans une iframe
  useEffect(() => {
    // Détecter si on est dans une iframe
    const isInIframe = window !== window.parent
    if (isInIframe) {
      document.documentElement.classList.add('in-iframe')
    }

    const handleMessage = (event: MessageEvent) => {
      if (!event.data?.type) return

      // Gestion du scroll
      if (event.data.type === 'scroll') {
        const deltaY = event.data.deltaY ?? 0
        const deltaX = event.data.deltaX ?? 0
        const cursorX = event.data.cursorX ?? 0
        const cursorY = event.data.cursorY ?? 0

        // Trouver l'élément sous le curseur
        const elementUnderCursor = document.elementFromPoint(cursorX, cursorY)

        // Chercher des conteneurs scrollables (horizontal et vertical)
        let horizontalScrollContainer: HTMLElement | null = null
        let verticalScrollContainer: HTMLElement | null = null
        let el = elementUnderCursor

        while (el) {
          if (el instanceof HTMLElement) {
            const style = window.getComputedStyle(el)

            // Vérifier scroll horizontal
            if (!horizontalScrollContainer) {
              const canScrollX = el.scrollWidth > el.clientWidth &&
                (style.overflowX === 'auto' || style.overflowX === 'scroll')
              if (canScrollX) {
                horizontalScrollContainer = el
              }
            }

            // Vérifier scroll vertical (modals, conteneurs)
            if (!verticalScrollContainer) {
              const canScrollY = el.scrollHeight > el.clientHeight &&
                (style.overflowY === 'auto' || style.overflowY === 'scroll')
              if (canScrollY) {
                verticalScrollContainer = el
              }
            }

            // Si on a trouvé les deux, on arrête
            if (horizontalScrollContainer && verticalScrollContainer) break
          }
          el = el.parentElement
        }

        // Déterminer la direction principale du scroll
        const isHorizontalScroll = Math.abs(deltaX) > Math.abs(deltaY)

        if (isHorizontalScroll && horizontalScrollContainer) {
          // Scroll horizontal sur le conteneur trouvé
          horizontalScrollContainer.scrollBy({ left: deltaX, behavior: 'auto' })
        } else if (verticalScrollContainer) {
          // Scroll vertical sur le conteneur trouvé (modal, etc.)
          verticalScrollContainer.scrollBy({ top: deltaY, behavior: 'auto' })
        } else {
          // Scroll vertical de la page principale
          window.scrollBy({ top: deltaY, behavior: 'auto' })
        }
      }

      // Gestion des clics simulés
      if (event.data.type === 'click' && typeof event.data.x === 'number' && typeof event.data.y === 'number') {
        const { x, y } = event.data
        const element = document.elementFromPoint(x, y)
        if (element) {
          // Simuler un clic complet (mousedown + mouseup + click)
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            view: window
          })
          element.dispatchEvent(clickEvent)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
      document.documentElement.classList.remove('in-iframe')
    }
  }, [])

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
  // Utilise isOwnerDynamic pour détecter la connexion après le chargement initial (via "Espace gestionnaire")
  useEffect(() => {
    if (user && isOwnerDynamic) {
      console.log('[EDIT MODE] Gestionnaire propriétaire détecté, activation du mode édition')
      setEditMode(true)

      // 🔒 Marquer ce navigateur comme propriétaire pour exclure du tracking (même déconnecté)
      try {
        localStorage.setItem(`welcomeapp_owner_${initialClient.slug}`, 'true')
        console.log('[ANALYTICS] Owner flag set, ce navigateur ne sera plus tracké')
      } catch (error) {
        console.error('[ANALYTICS] Erreur lors du set du owner flag:', error)
      }
    } else if (!user) {
      console.log('[EDIT MODE] Aucun utilisateur connecté, désactivation du mode édition')
      setEditMode(false)
    }
  }, [user, isOwnerDynamic, initialClient.slug])

  // Mode édition actif UNIQUEMENT si l'utilisateur est le propriétaire
  // Utilise isOwnerDynamic pour supporter la connexion via "Espace gestionnaire" après le chargement initial
  const isEditMode = !!(user && editMode && isOwnerDynamic)

  // 📊 Track page view (visiteurs uniquement, pas en mode édition)
  useEffect(() => {
    // Ne pas tracker si :
    // - Mode édition actif (gestionnaire propriétaire)
    // - Analytics pas encore prêt
    if (isEditMode || !isAnalyticsReady) return

    console.log('[ANALYTICS] Tracking page view pour welcomebook:', initialClient.slug)
    trackView(initialClient.id)
  }, [isEditMode, isAnalyticsReady, initialClient.id, initialClient.slug, trackView])

  // Handler pour clic sur tip (track analytics + ouvre modal)
  const handleTipClick = (tip: TipWithDetails) => {
    setSelectedTip(tip)

    // Track clic uniquement si mode visiteur (pas gestionnaire)
    if (!isEditMode && isAnalyticsReady) {
      console.log('[ANALYTICS] Tracking tip click:', tip.title)
      trackClick(initialClient.id, tip.id)
    }
  }

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

  // Handler pour mettre à jour le nom d'une catégorie (optimistic)
  const handleCategoryUpdate = async (categoryId: string, newName: string) => {
    // Sauvegarder l'ancien état pour rollback
    const oldCategories = [...categories]

    // Mise à jour INSTANTANÉE du nom de la catégorie
    const updatedCategories = categories.map((cat) =>
      cat.id === categoryId ? { ...cat, name: newName } : cat
    )
    setCategories(updatedCategories)

    try {
      // Appel serveur en arrière-plan
      const { updateCategory } = await import('@/lib/actions/tips')
      const result = await updateCategory(categoryId, newName)
      if (result.error || !result.category) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      // Rollback en cas d'erreur
      console.error('[UPDATE CATEGORY] Erreur:', error)
      setCategories(oldCategories)
    }
  }

  // Handler pour supprimer une catégorie
  const handleCategoryDelete = async (categoryId: string, categoryName: string) => {
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?\n\nTous les conseils de cette catégorie seront également supprimés.`
    )

    if (!confirmDelete) return

    // Sauvegarder l'ancien état pour rollback
    const oldCategories = [...categories]
    const oldTips = [...tips]

    // Suppression INSTANTANÉE de la catégorie et ses tips
    setCategories(categories.filter((cat) => cat.id !== categoryId))
    setTips(tips.filter((tip) => tip.category_id !== categoryId))

    try {
      // Appel serveur en arrière-plan
      const { deleteCategory } = await import('@/lib/actions/tips')
      const result = await deleteCategory(categoryId)
      if (result.error || !result.id) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      // Rollback en cas d'erreur
      console.error('[DELETE CATEGORY] Erreur:', error)
      setCategories(oldCategories)
      setTips(oldTips)
      alert('Erreur lors de la suppression de la catégorie')
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
  const categoryTitleColor = client.category_title_color || themeColor
  const backgroundColorFinal = client.background_image
    ? undefined
    : (client.sync_background_with_header
      ? themeColor
      : client.sync_background_with_footer
        ? (client.footer_color || '#1E1B4B')
        : (client.background_color || '#f3f4f6'))

  return (
    <>
      {/* Background fixe qui ne bouge jamais et couvre toute la hauteur mobile */}
      <div
        className="bg-fixed-mobile bg-size-responsive -z-20"
        style={{
          backgroundImage: client.background_image ? `url(${client.background_image})` : undefined,
          backgroundColor: backgroundColorFinal,
          backgroundPosition: '50% 50%',
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
        isOwner={!!(user && isOwnerDynamic)}
        onEdit={() => {
          setCustomizationInitialTab('background')
          setShowCustomizationMenu(true)
        }}
        hasSecureSection={!!client.secure_section}
        locale={locale}
        onLocaleChange={handleLocaleChange}
        onAddTip={() => setShowAddTipModal(true)}
        onAddCategory={() => setShowAddCategoryModal(true)}
        onAddMessage={() => {
          setCustomizationInitialTab('message')
          setShowCustomizationMenu(true)
        }}
        onSecureSection={() => setShowSecureSectionEditModal(true)}
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
                      ? 'text-white shadow-lg'
                      : 'bg-white text-gray-800 hover:bg-gray-100 active:scale-95 shadow-md ring-1 ring-gray-200'
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
                        ? 'text-white shadow-lg'
                        : 'bg-white text-gray-800 hover:bg-gray-100 active:scale-95 shadow-md ring-1 ring-gray-200'
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
              {selectedCategory === null && !showFavoritesOnly ? (
                <>
                  <DraggableCategoriesWrapper
                    categoriesData={categoriesData}
                    isEditMode={isEditMode}
                    onTipClick={handleTipClick}
                    onTipEdit={(tip) => setEditingTip(tip)}
                    onTipDelete={(tip) => handleDeleteRequest(tip)}
                    onTipsReorder={handleTipsReorder}
                    onCategoryUpdate={handleCategoryUpdate}
                    onCategoryDelete={handleCategoryDelete}
                    onViewAll={(category, tips) => setCategoryFullView({ category, tips })}
                    themeColor={themeColor}
                    categoryTitleColor={categoryTitleColor}
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
                            onClick={() => handleTipClick(tip)}
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
                        onClick={() => handleTipClick(tip)}
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
                  // Props pour le mode fullscreen immersif
                  categories={categoriesWithTips}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  showFavoritesOnly={showFavoritesOnly}
                  onFavoritesToggle={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  favoritesCount={favoritesCount}
                  locale={locale}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                  isEditMode={isEditMode}
                />
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer
        client={client}
        isEditMode={isEditMode}
        onEdit={() => {
          setCustomizationInitialTab('background')
          setShowCustomizationMenu(true)
        }}
        locale={locale}
        onManagerLogin={() => setShowLoginModal(true)}
      />

      {/* PWA Install Prompt - Uniquement pour les visiteurs */}
      {!isEditMode && (
        <PWAInstallPrompt
          clientName={client.name}
          onInstall={() => {
            if (isAnalyticsReady) {
              console.log('[ANALYTICS] Tracking PWA installation')
              trackInstall(initialClient.id)
            }
          }}
        />
      )}

      {/* Welcome Message Modal - Uniquement pour les visiteurs */}
      {!isEditMode && client.welcome_message && (
        <WelcomeMessageModal
          message={client.welcome_message}
          clientName={client.name}
          clientSlug={client.slug}
          locale={locale}
          photoUrl={client.welcome_message_photo}
        />
      )}

      {/* Notice Section Sécurisée - Uniquement pour visiteurs si section existe */}
      {!isEditMode && client.secure_section && (
        <SecureSectionNotice
          slug={client.slug}
          locale={locale}
          themeColor={themeColor}
          onOpenSecureSection={() => setShowSecureSectionViewModal(true)}
        />
      )}

      {/* Modal Section Sécurisée (vue visiteur) */}
      <SecureSectionModal
        isOpen={showSecureSectionViewModal}
        onClose={() => setShowSecureSectionViewModal(false)}
        clientId={client.id}
        locale={locale}
      />

      {/* Modal Vue Complète Catégorie */}
      {categoryFullView && (
        <CategoryFullViewModal
          isOpen={!!categoryFullView}
          onClose={() => setCategoryFullView(null)}
          category={categoryFullView.category}
          tips={categoryFullView.tips}
          onTipClick={(tip) => {
            setCategoryFullView(null)
            handleTipClick(tip)
          }}
          themeColor={themeColor}
          locale={locale}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      )}

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

      <CategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSuccess={() => {
          // Recharger la page pour afficher la nouvelle catégorie
          window.location.reload()
        }}
        clientId={client.id}
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
        onSuccess={(updatedFields) => {
          // Mise à jour optimiste de l'état local
          setCustomization((prev) => ({ ...prev, ...updatedFields }))
          setShowCustomizationMenu(false)
          // Optionnel : refresh en background pour garantir la cohérence
          router.refresh()
        }}
        client={client}
        initialTab={customizationInitialTab}
      />

      <SecureSectionEditModal
        isOpen={showSecureSectionEditModal}
        onClose={() => setShowSecureSectionEditModal(false)}
        onSuccess={() => {
          // Refresh pour afficher le bouton "Infos d'arrivée" si nouvelle section
          router.refresh()
        }}
        client={client}
      />
      </div>
    </>
  )
}
