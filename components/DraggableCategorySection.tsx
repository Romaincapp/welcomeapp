'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import DraggableTipCard from './DraggableTipCard'
import EditableCategoryTitle from './EditableCategoryTitle'
import { TipWithDetails, Category } from '@/types'
import { GripVertical, ChevronRight } from 'lucide-react'
import { type Locale } from '@/i18n/request'
import { useClientTranslation } from '@/hooks/useClientTranslation'

interface DraggableCategorySectionProps {
  category: Category
  tips: TipWithDetails[]
  isEditMode: boolean
  onTipClick: (tip: TipWithDetails) => void
  onTipEdit: (tip: TipWithDetails) => void
  onTipDelete: (tip: { id: string; title: string }) => void
  onTipsReorder: (categoryId: string, tipIds: string[]) => void
  onCategoryUpdate?: (categoryId: string, newName: string) => Promise<void>
  onCategoryDelete?: (categoryId: string, categoryName: string) => void
  onViewAll?: (category: Category, tips: TipWithDetails[]) => void
  themeColor?: string
  locale?: Locale
  isFavorite?: (tipId: string) => boolean
  onToggleFavorite?: (tipId: string) => void
}

export default function DraggableCategorySection({
  category,
  tips: initialTips,
  isEditMode,
  onTipClick,
  onTipEdit,
  onTipDelete,
  onTipsReorder,
  onCategoryUpdate,
  onCategoryDelete,
  onViewAll,
  themeColor = '#4F46E5',
  locale = 'fr',
  isFavorite,
  onToggleFavorite,
}: DraggableCategorySectionProps) {
  const [tips, setTips] = useState(initialTips)
  const [activeTipId, setActiveTipId] = useState<string | null>(null)

  // Synchroniser l'état local avec les props pour les optimistic updates
  useEffect(() => {
    setTips(initialTips)
  }, [initialTips])

  // 🌍 Traduction côté client du nom de catégorie
  const { translated: categoryName } = useClientTranslation(
    category.name,
    'fr',
    locale
  )

  // Traduction "Voir tout"
  const { translated: tViewAll } = useClientTranslation('Voir tout', 'fr', locale)

  const sensors = useSensors(
    // Souris/Desktop : activer après 8px de mouvement
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    // Touch/Mobile : activer après 250ms d'appui prolongé
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8, // Augmenté pour mieux distinguer scroll vs drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTipId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tips.findIndex((tip) => tip.id === active.id)
      const newIndex = tips.findIndex((tip) => tip.id === over.id)

      const newTips = arrayMove(tips, oldIndex, newIndex)
      setTips(newTips)

      // Appeler le callback avec le nouvel ordre
      onTipsReorder(
        category.id,
        newTips.map((tip) => tip.id)
      )
    }

    setActiveTipId(null)
  }

  const handleDragCancel = () => {
    setActiveTipId(null)
  }

  const activeTip = tips.find((tip) => tip.id === activeTipId)

  const handleCategoryUpdate = async (newName: string) => {
    if (onCategoryUpdate) {
      await onCategoryUpdate(category.id, newName)
    }
  }

  const handleCategoryDelete = () => {
    if (onCategoryDelete) {
      onCategoryDelete(category.id, categoryName)
    }
  }

  return (
    <section className="mb-8 sm:mb-10 md:mb-12">
      <div className="flex items-center justify-between mb-4 sm:mb-6 pl-4 pr-4">
        {isEditMode && onCategoryUpdate ? (
          <EditableCategoryTitle
            title={categoryName}
            onSave={handleCategoryUpdate}
            onDelete={onCategoryDelete ? handleCategoryDelete : undefined}
          />
        ) : (
          <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg flex items-center gap-2 sm:gap-3">
            {categoryName}
          </h2>
        )}
        {/* Bouton "Voir tout" - affiché seulement si plus de 2 conseils et pas en mode édition */}
        {!isEditMode && tips.length > 2 && onViewAll && (
          <button
            onClick={() => onViewAll(category, tips)}
            className="flex items-center gap-1 text-white/90 hover:text-white text-sm sm:text-base font-medium transition-colors group"
          >
            <span>{tViewAll}</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {isEditMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={tips.map((tip) => tip.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-2 xs:gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide px-4 -mx-4 relative">
              {tips.map((tip) => (
                <DraggableTipCard
                  key={tip.id}
                  tip={tip}
                  onClick={() => onTipClick(tip)}
                  isEditMode={isEditMode}
                  onEdit={() => onTipEdit(tip)}
                  onDelete={() => onTipDelete({ id: tip.id, title: tip.title })}
                  themeColor={themeColor}
                  showCategoryBadge={false}
                  isFavorite={isFavorite ? isFavorite(tip.id) : false}
                  onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(tip.id) : undefined}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeTip ? (
              <DraggableTipCard
                tip={activeTip}
                onClick={() => {}}
                isEditMode={false}
                themeColor={themeColor}
                showCategoryBadge={false}
                isFavorite={isFavorite ? isFavorite(activeTip.id) : false}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(activeTip.id) : undefined}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex gap-2 xs:gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide px-4 -mx-4 relative">
          {tips.map((tip) => (
            <DraggableTipCard
              key={tip.id}
              tip={tip}
              onClick={() => onTipClick(tip)}
              isEditMode={false}
              themeColor={themeColor}
              showCategoryBadge={false}
              isFavorite={isFavorite ? isFavorite(tip.id) : false}
              onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(tip.id) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  )
}
