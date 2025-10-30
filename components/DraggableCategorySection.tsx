'use client'

import { useState } from 'react'
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
import { TipWithDetails, Category } from '@/types'
import { GripVertical } from 'lucide-react'
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
  themeColor?: string
  locale?: Locale
}

export default function DraggableCategorySection({
  category,
  tips: initialTips,
  isEditMode,
  onTipClick,
  onTipEdit,
  onTipDelete,
  onTipsReorder,
  themeColor = '#4F46E5',
  locale = 'fr',
}: DraggableCategorySectionProps) {
  const [tips, setTips] = useState(initialTips)
  const [activeTipId, setActiveTipId] = useState<string | null>(null)

  // 🌍 Traduction côté client du nom de catégorie
  const { translated: categoryName } = useClientTranslation(
    category.name,
    'fr',
    locale
  )

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

  return (
    <section className="mb-8 sm:mb-10 md:mb-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg flex items-center gap-2 sm:gap-3 pl-4">
        {category.icon && <span className="text-3xl sm:text-4xl">{category.icon}</span>}
        {categoryName}
      </h2>

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
            />
          ))}
        </div>
      )}
    </section>
  )
}
