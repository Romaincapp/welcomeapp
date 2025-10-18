'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Plus, LogOut, Palette } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TipCard from '@/components/TipCard'
import TipModal from '@/components/TipModal'
import InteractiveMap from '@/components/InteractiveMap'
import DevLoginModal from '@/components/DevLoginModal'
import AddTipModal from '@/components/AddTipModal'
import EditTipModal from '@/components/EditTipModal'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import CustomizationMenu from '@/components/CustomizationMenu'
import DraggableCategoriesWrapper from '@/components/DraggableCategoriesWrapper'
import { useDevAuth } from '@/hooks/useDevAuth'
import { ClientWithDetails, TipWithDetails, Category } from '@/types'
import { reorderTips } from '@/lib/actions/reorder'

interface WelcomeBookClientProps {
  client: ClientWithDetails
  isOwner: boolean
}

export default function WelcomeBookClient({ client, isOwner }: WelcomeBookClientProps) {
  const router = useRouter()
  const { user, login, logout } = useDevAuth()
  const [selectedTip, setSelectedTip] = useState<TipWithDetails | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAddTipModal, setShowAddTipModal] = useState(false)
  const [showCustomizationMenu, setShowCustomizationMenu] = useState(false)
  const [editingTip, setEditingTip] = useState<TipWithDetails | null>(null)
  const [deletingTip, setDeletingTip] = useState<{ id: string; title: string } | null>(null)
  const [editMode, setEditMode] = useState(false)

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
        className="bg-fixed-mobile -z-20"
        style={{
          backgroundImage: client.background_image ? `url(${client.background_image})` : undefined,
          backgroundColor: client.background_image ? undefined : '#f3f4f6',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Overlay pour améliorer la lisibilité */}
      {client.background_image && (
        <div className="bg-fixed-mobile bg-black bg-opacity-30 -z-10" />
      )}

      <div
        className="min-h-screen flex flex-col relative"
        style={{
          '--theme-color': themeColor,
        } as React.CSSProperties}
      >

      {/* Bouton de connexion / mode édition */}
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-40 flex gap-1.5 sm:gap-3 flex-wrap justify-end max-w-[calc(100vw-1rem)]">
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

      {/* Bouton flottant pour ajouter un conseil */}
      {isEditMode && (
        <button
          onClick={() => setShowAddTipModal(true)}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40 text-white p-3 sm:p-4 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95"
          style={{ backgroundColor: themeColor }}
        >
          <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      <Header client={client} isEditMode={false} hasSecureSection={!!client.secure_section} />

      <main className="flex-1 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          {/* Filtres de catégorie */}
          {categoriesWithTips.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
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

          {/* Sections de conseils par catégorie */}
          {selectedCategory === null ? (
            <>
              <DraggableCategoriesWrapper
                categoriesData={categoriesData}
                isEditMode={isEditMode}
                onTipClick={(tip) => setSelectedTip(tip)}
                onTipEdit={(tip) => setEditingTip(tip)}
                onTipDelete={(tip) => setDeletingTip(tip)}
                onTipsReorder={handleTipsReorder}
                themeColor={themeColor}
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
                        onDelete={() => setDeletingTip({ id: tip.id, title: tip.title })}
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
                    onDelete={() => setDeletingTip({ id: tip.id, title: tip.title })}
                    themeColor={themeColor}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Carte interactive */}
          <section className="mb-8 sm:mb-10 md:mb-12 relative z-0">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg px-1">
              Carte des lieux
            </h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[300px] sm:h-[400px] md:h-[500px] relative z-0">
              <InteractiveMap
                tips={filteredTips.filter((tip) => tip.coordinates_parsed)}
                onMarkerClick={(tip) => setSelectedTip(tip)}
                themeColor={themeColor}
              />
            </div>
          </section>
        </div>
      </main>

      <Footer client={client} buttons={client.footer_buttons} isEditMode={false} />

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

      <DeleteConfirmDialog
        isOpen={!!deletingTip}
        onClose={() => setDeletingTip(null)}
        onSuccess={() => {
          setDeletingTip(null)
          router.refresh()
        }}
        tipId={deletingTip?.id || ''}
        tipTitle={deletingTip?.title || ''}
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
