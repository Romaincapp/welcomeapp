'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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

interface DraggableCategorySectionProps {
  category: Category
  tips: TipWithDetails[]
  isEditMode: boolean
  onTipClick: (tip: TipWithDetails) => void
  onTipEdit: (tip: TipWithDetails) => void
  onTipDelete: (tip: { id: string; title: string }) => void
  onTipsReorder: (categoryId: string, tipIds: string[]) => void
  themeColor?: string
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
}: DraggableCategorySectionProps) {
  const [tips, setTips] = useState(initialTips)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Commencer le drag après 8px de mouvement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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
  }

  return (
    <section className="mb-8 sm:mb-10 md:mb-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg flex items-center gap-2 sm:gap-3 px-1">
        {category.icon && <span className="text-3xl sm:text-4xl">{category.icon}</span>}
        {category.name}
      </h2>

      {isEditMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tips.map((tip) => tip.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide px-1 -mx-1">
              {tips.map((tip) => (
                <DraggableTipCard
                  key={tip.id}
                  tip={tip}
                  onClick={() => onTipClick(tip)}
                  isEditMode={isEditMode}
                  onEdit={() => onTipEdit(tip)}
                  onDelete={() => onTipDelete({ id: tip.id, title: tip.title })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide px-1 -mx-1">
          {tips.map((tip) => (
            <DraggableTipCard
              key={tip.id}
              tip={tip}
              onClick={() => onTipClick(tip)}
              isEditMode={false}
            />
          ))}
        </div>
      )}
    </section>
  )
}
