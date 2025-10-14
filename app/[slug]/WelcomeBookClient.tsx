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
import { useDevAuth } from '@/hooks/useDevAuth'
import { ClientWithDetails, TipWithDetails, Category } from '@/types'

interface WelcomeBookClientProps {
  client: ClientWithDetails
}

export default function WelcomeBookClient({ client }: WelcomeBookClientProps) {
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

  // Mode édition actif si l'utilisateur est connecté
  const isEditMode = !!(user && editMode)

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

  // Conseils sans catégorie
  const uncategorizedTips = client.tips.filter((tip) => !tip.category_id)

  // Filtrer les conseils selon la catégorie sélectionnée
  const filteredTips = selectedCategory
    ? client.tips.filter((tip) => tip.category_id === selectedCategory)
    : client.tips

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: client.background_image ? `url(${client.background_image})` : undefined,
        backgroundColor: client.background_image ? undefined : '#f3f4f6',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay pour améliorer la lisibilité */}
      {client.background_image && (
        <div className="fixed inset-0 bg-black bg-opacity-30 -z-10" />
      )}

      {/* Bouton de connexion / mode édition */}
      <div className="fixed top-4 right-4 z-40 flex gap-3">
        {!user ? (
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-lg font-semibold transition flex items-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Connexion gestionnaire
          </button>
        ) : (
          <>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg shadow-lg font-semibold transition flex items-center gap-2 ${
                editMode
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              {editMode ? 'Quitter l\'édition' : 'Mode édition'}
            </button>
            {editMode && (
              <button
                onClick={() => setShowCustomizationMenu(true)}
                className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-lg font-semibold transition flex items-center gap-2"
              >
                <Palette className="w-5 h-5" />
                Personnaliser
              </button>
            )}
            <button
              onClick={async () => {
                await logout()
                setEditMode(false)
              }}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg shadow-lg font-semibold transition flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </>
        )}
      </div>

      {/* Bouton flottant pour ajouter un conseil */}
      {isEditMode && (
        <button
          onClick={() => setShowAddTipModal(true)}
          className="fixed bottom-8 right-8 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}

      <Header client={client} isEditMode={false} />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filtres de catégorie */}
          {client.categories.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    selectedCategory === null
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Tous
                </button>
                {client.categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                      selectedCategory === category.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {category.icon && <span>{category.icon}</span>}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sections de conseils par catégorie */}
          {selectedCategory === null ? (
            <>
              {Object.values(tipsByCategory).map(({ category, tips }) => (
                <section key={category.id} className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-white drop-shadow-lg flex items-center gap-3">
                    {category.icon && <span className="text-4xl">{category.icon}</span>}
                    {category.name}
                  </h2>
                  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {tips.map((tip) => (
                      <TipCard
                        key={tip.id}
                        tip={tip}
                        onClick={() => setSelectedTip(tip)}
                        isEditMode={isEditMode}
                        onEdit={() => setEditingTip(tip)}
                        onDelete={() => setDeletingTip({ id: tip.id, title: tip.title })}
                      />
                    ))}
                  </div>
                </section>
              ))}

              {uncategorizedTips.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">
                    Autres conseils
                  </h2>
                  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {uncategorizedTips.map((tip) => (
                      <TipCard
                        key={tip.id}
                        tip={tip}
                        onClick={() => setSelectedTip(tip)}
                        isEditMode={isEditMode}
                        onEdit={() => setEditingTip(tip)}
                        onDelete={() => setDeletingTip({ id: tip.id, title: tip.title })}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <section className="mb-12">
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {filteredTips.map((tip) => (
                  <TipCard
                    key={tip.id}
                    tip={tip}
                    onClick={() => setSelectedTip(tip)}
                    isEditMode={isEditMode}
                    onEdit={() => setEditingTip(tip)}
                    onDelete={() => setDeletingTip({ id: tip.id, title: tip.title })}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Carte interactive */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">
              Carte des lieux
            </h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[500px]">
              <InteractiveMap
                tips={filteredTips.filter((tip) => tip.coordinates_parsed)}
                onMarkerClick={(tip) => setSelectedTip(tip)}
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
      />

      <AddTipModal
        isOpen={showAddTipModal}
        onClose={() => setShowAddTipModal(false)}
        onSuccess={() => {
          setShowAddTipModal(false)
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
  )
}
