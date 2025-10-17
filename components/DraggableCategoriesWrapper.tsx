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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DraggableCategorySection from './DraggableCategorySection'
import { TipWithDetails, Category } from '@/types'
import { GripVertical } from 'lucide-react'
import { reorderCategories } from '@/lib/actions/reorder'

interface CategoryWithTips {
  category: Category
  tips: TipWithDetails[]
}

interface DraggableCategoriesWrapperProps {
  categoriesData: CategoryWithTips[]
  isEditMode: boolean
  onTipClick: (tip: TipWithDetails) => void
  onTipEdit: (tip: TipWithDetails) => void
  onTipDelete: (tip: { id: string; title: string }) => void
  onTipsReorder: (categoryId: string, tipIds: string[]) => void
  themeColor?: string
}

function SortableCategoryWrapper({
  categoryData,
  isEditMode,
  onTipClick,
  onTipEdit,
  onTipDelete,
  onTipsReorder,
  themeColor,
}: {
  categoryData: CategoryWithTips
  isEditMode: boolean
  onTipClick: (tip: TipWithDetails) => void
  onTipEdit: (tip: TipWithDetails) => void
  onTipDelete: (tip: { id: string; title: string }) => void
  onTipsReorder: (categoryId: string, tipIds: string[]) => void
  themeColor?: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: categoryData.category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  if (!isEditMode) {
    return (
      <DraggableCategorySection
        category={categoryData.category}
        tips={categoryData.tips}
        isEditMode={false}
        onTipClick={onTipClick}
        onTipEdit={onTipEdit}
        onTipDelete={onTipDelete}
        onTipsReorder={onTipsReorder}
        themeColor={themeColor}
      />
    )
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag Handle pour la catégorie */}
      <div className="absolute -left-3 top-4 sm:top-6 z-20 flex items-center">
        <div
          {...attributes}
          {...listeners}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg shadow-lg cursor-grab active:cursor-grabbing transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5" />
        </div>
      </div>

      <DraggableCategorySection
        category={categoryData.category}
        tips={categoryData.tips}
        isEditMode={isEditMode}
        onTipClick={onTipClick}
        onTipEdit={onTipEdit}
        onTipDelete={onTipDelete}
        onTipsReorder={onTipsReorder}
        themeColor={themeColor}
      />
    </div>
  )
}

export default function DraggableCategoriesWrapper({
  categoriesData: initialCategoriesData,
  isEditMode,
  onTipClick,
  onTipEdit,
  onTipDelete,
  onTipsReorder,
  themeColor = '#4F46E5',
}: DraggableCategoriesWrapperProps) {
  const [categoriesData, setCategoriesData] = useState(initialCategoriesData)

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = categoriesData.findIndex(
        (catData) => catData.category.id === active.id
      )
      const newIndex = categoriesData.findIndex(
        (catData) => catData.category.id === over.id
      )

      const newCategoriesData = arrayMove(categoriesData, oldIndex, newIndex)
      setCategoriesData(newCategoriesData)

      // Sauvegarder l'ordre dans la base de données
      const categoryIds = newCategoriesData.map((catData) => catData.category.id)
      await reorderCategories(categoryIds)
    }
  }

  if (!isEditMode) {
    return (
      <>
        {categoriesData.map((categoryData) => (
          <DraggableCategorySection
            key={categoryData.category.id}
            category={categoryData.category}
            tips={categoryData.tips}
            isEditMode={false}
            onTipClick={onTipClick}
            onTipEdit={onTipEdit}
            onTipDelete={onTipDelete}
            onTipsReorder={onTipsReorder}
            themeColor={themeColor}
          />
        ))}
      </>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={categoriesData.map((catData) => catData.category.id)}
        strategy={verticalListSortingStrategy}
      >
        {categoriesData.map((categoryData) => (
          <SortableCategoryWrapper
            key={categoryData.category.id}
            categoryData={categoryData}
            isEditMode={isEditMode}
            onTipClick={onTipClick}
            onTipEdit={onTipEdit}
            onTipDelete={onTipDelete}
            onTipsReorder={onTipsReorder}
            themeColor={themeColor}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}
