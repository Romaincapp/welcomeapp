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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DraggableCategorySection from './DraggableCategorySection'
import { TipWithDetails, Category } from '@/types'
import { GripVertical } from 'lucide-react'
import { reorderCategories } from '@/lib/actions/reorder'
import { type Locale } from '@/i18n/request'

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
  onCategoryUpdate?: (categoryId: string, newName: string) => Promise<void>
  onCategoryDelete?: (categoryId: string, categoryName: string) => void
  onViewAll?: (category: Category, tips: TipWithDetails[]) => void
  themeColor?: string
  categoryTitleColor?: string
  locale?: Locale
  isFavorite?: (tipId: string) => boolean
  onToggleFavorite?: (tipId: string) => void
}

function SortableCategoryWrapper({
  categoryData,
  isEditMode,
  onTipClick,
  onTipEdit,
  onTipDelete,
  onTipsReorder,
  onCategoryUpdate,
  onCategoryDelete,
  onViewAll,
  themeColor,
  categoryTitleColor,
  locale = 'fr',
  isFavorite,
  onToggleFavorite,
}: {
  categoryData: CategoryWithTips
  isEditMode: boolean
  onTipClick: (tip: TipWithDetails) => void
  onTipEdit: (tip: TipWithDetails) => void
  onTipDelete: (tip: { id: string; title: string }) => void
  onTipsReorder: (categoryId: string, tipIds: string[]) => void
  onCategoryUpdate?: (categoryId: string, newName: string) => Promise<void>
  onCategoryDelete?: (categoryId: string, categoryName: string) => void
  onViewAll?: (category: Category, tips: TipWithDetails[]) => void
  themeColor?: string
  categoryTitleColor?: string
  locale?: Locale
  isFavorite?: (tipId: string) => boolean
  onToggleFavorite?: (tipId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: categoryData.category.id })

  const [isPressing, setIsPressing] = useState(false)
  const [pressProgress, setPressProgress] = useState(0)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Gérer le timer de progression
  useEffect(() => {
    if (isPressing && !isDragging) {
      const startTime = Date.now()
      const duration = 300 // 300ms

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min((elapsed / duration) * 100, 100)
        setPressProgress(progress)

        if (progress >= 100) {
          clearInterval(interval)
        }
      }, 16) // ~60fps

      return () => clearInterval(interval)
    } else {
      setPressProgress(0)
    }
  }, [isPressing, isDragging])

  // Feedback haptique au début du drag
  useEffect(() => {
    if (isDragging && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }, [isDragging])

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
        onCategoryUpdate={onCategoryUpdate}
        onCategoryDelete={onCategoryDelete}
        onViewAll={onViewAll}
        themeColor={themeColor}
        categoryTitleColor={categoryTitleColor}
        locale={locale}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    )
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Indicateur d'appui prolongé pour mobile avec barre de progression */}
      {isPressing && (
        <>
          <div className="absolute inset-0 border-4 border-yellow-400 rounded-xl z-30 pointer-events-none" />
          {/* Barre de progression */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-300 rounded-t-xl z-30 pointer-events-none overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-75"
              style={{ width: `${pressProgress}%` }}
            />
          </div>
        </>
      )}

      {/* Drag Handle pour la catégorie */}
      <div className="absolute -left-3 top-4 sm:top-6 z-20 flex items-center">
        <div
          {...attributes}
          {...listeners}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg shadow-lg cursor-grab active:cursor-grabbing transition-all duration-150"
          style={{
            filter: isPressing ? 'brightness(1.2)' : 'brightness(1)',
            transform: isPressing ? 'scale(1.1)' : 'scale(1)',
            touchAction: 'none', // touchAction appliqué uniquement sur le handle
          }}
          onTouchStart={() => setIsPressing(true)}
          onTouchEnd={() => setIsPressing(false)}
          onTouchCancel={() => setIsPressing(false)}
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
        onCategoryUpdate={onCategoryUpdate}
        onCategoryDelete={onCategoryDelete}
        onViewAll={onViewAll}
        themeColor={themeColor}
        categoryTitleColor={categoryTitleColor}
        locale={locale}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
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
  onCategoryUpdate,
  onCategoryDelete,
  onViewAll,
  themeColor = '#4F46E5',
  categoryTitleColor,
  locale = 'fr',
  isFavorite,
  onToggleFavorite,
}: DraggableCategoriesWrapperProps) {
  const [categoriesData, setCategoriesData] = useState(initialCategoriesData)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  // Synchroniser l'état local avec les props pour les optimistic updates
  useEffect(() => {
    setCategoriesData(initialCategoriesData)
  }, [initialCategoriesData])

  const sensors = useSensors(
    // Souris/Desktop : activer après 8px de mouvement
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    // Touch/Mobile : activer après 300ms d'appui prolongé (augmenté pour catégories)
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,        // Augmenté de 250ms → 300ms pour laisser plus de temps
        tolerance: 15,     // Augmenté de 8px → 15px pour éviter l'annulation accidentelle
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCategoryId(event.active.id as string)
  }

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

    setActiveCategoryId(null)
  }

  const handleDragCancel = () => {
    setActiveCategoryId(null)
  }

  const activeCategoryData = categoriesData.find(
    (catData) => catData.category.id === activeCategoryId
  )

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
            onCategoryUpdate={onCategoryUpdate}
            onCategoryDelete={onCategoryDelete}
            onViewAll={onViewAll}
            themeColor={themeColor}
        categoryTitleColor={categoryTitleColor}
            locale={locale}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
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
            onCategoryUpdate={onCategoryUpdate}
            onCategoryDelete={onCategoryDelete}
            onViewAll={onViewAll}
            themeColor={themeColor}
            categoryTitleColor={categoryTitleColor}
            locale={locale}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </SortableContext>
      <DragOverlay>
        {activeCategoryData ? (
          <DraggableCategorySection
            category={activeCategoryData.category}
            tips={activeCategoryData.tips}
            isEditMode={false}
            onTipClick={onTipClick}
            onTipEdit={onTipEdit}
            onTipDelete={onTipDelete}
            onTipsReorder={onTipsReorder}
            onCategoryUpdate={onCategoryUpdate}
            onCategoryDelete={onCategoryDelete}
            onViewAll={onViewAll}
            themeColor={themeColor}
            categoryTitleColor={categoryTitleColor}
            locale={locale}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
