'use client'

import { useState } from 'react'
import { LogIn, Plus } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TipCard from '@/components/TipCard'
import TipModal from '@/components/TipModal'
import InteractiveMap from '@/components/InteractiveMap'
import LoginModal from '@/components/LoginModal'
import { useAuth } from '@/components/AuthProvider'
import { ClientWithDetails, TipWithDetails, Category } from '@/types'

interface WelcomeBookClientProps {
  client: ClientWithDetails
}

export default function WelcomeBookClient({ client }: WelcomeBookClientProps) {
  const { user } = useAuth()
  const [selectedTip, setSelectedTip] = useState<TipWithDetails | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
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
        )}
      </div>

      {/* Bouton flottant pour ajouter un conseil */}
      {isEditMode && (
        <button
          onClick={() => {/* TODO: Ouvrir modal d'ajout */}}
          className="fixed bottom-8 right-8 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}

      <Header client={client} isEditMode={isEditMode} />

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

      <Footer client={client} buttons={client.footer_buttons} isEditMode={isEditMode} />

      {/* Modales */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setEditMode(true)}
      />

      <TipModal
        tip={selectedTip}
        isOpen={!!selectedTip}
        onClose={() => setSelectedTip(null)}
      />
    </div>
  )
}
