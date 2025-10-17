'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TipCard from './TipCard'
import { TipWithDetails } from '@/types'
import { GripVertical } from 'lucide-react'

interface DraggableTipCardProps {
  tip: TipWithDetails
  onClick: () => void
  isEditMode?: boolean
  onEdit?: () => void
  onDelete?: () => void
  compact?: boolean
  themeColor?: string
}

export default function DraggableTipCard({
  tip,
  onClick,
  isEditMode = false,
  onEdit,
  onDelete,
  compact = false,
  themeColor = '#4F46E5'
}: DraggableTipCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tip.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  // Si pas en mode édition, afficher le TipCard normal
  if (!isEditMode) {
    return (
      <TipCard
        tip={tip}
        onClick={onClick}
        isEditMode={false}
        compact={compact}
        themeColor={themeColor}
      />
    )
  }

  // En mode édition, wrapper le TipCard avec le drag handle
  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1/2 -translate-y-1/2 -left-1 xs:-left-2 sm:-left-3 z-20 text-white p-1 xs:p-1.5 sm:p-2 rounded-lg shadow-lg cursor-grab active:cursor-grabbing transition-colors"
        style={{
          backgroundColor: themeColor,
          filter: 'brightness(0.9)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = 'brightness(0.8)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = 'brightness(0.9)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
      </div>

      {/* TipCard avec boutons d'édition */}
      <TipCard
        tip={tip}
        onClick={onClick}
        isEditMode={isEditMode}
        onEdit={onEdit}
        onDelete={onDelete}
        compact={compact}
        themeColor={themeColor}
      />
    </div>
  )
}
