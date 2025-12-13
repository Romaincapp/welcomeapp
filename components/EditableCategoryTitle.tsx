'use client'

import { useState, useRef, useEffect } from 'react'
import { Pencil, Check, X, Trash2 } from 'lucide-react'

interface EditableCategoryTitleProps {
  title: string
  onSave: (newTitle: string) => Promise<void>
  onDelete?: () => void
  className?: string
}

export default function EditableCategoryTitle({
  title,
  onSave,
  onDelete,
  className = '',
}: EditableCategoryTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus automatique quand on entre en mode édition
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Réinitialiser le titre si la prop change
  useEffect(() => {
    setEditedTitle(title)
  }, [title])

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedTitle(title)
    setIsEditing(false)
  }

  const handleSave = async () => {
    const trimmedTitle = editedTitle.trim()

    // Ne rien faire si le titre est vide ou identique
    if (!trimmedTitle || trimmedTitle === title) {
      handleCancel()
      return
    }

    setIsSaving(true)
    try {
      await onSave(trimmedTitle)
      setIsEditing(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      // Rester en mode édition en cas d'erreur
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <input
          ref={inputRef}
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className={`bg-white/10 text-white border-2 border-white/30 rounded-lg px-3 py-1 text-2xl sm:text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 flex-1 min-w-0 ${className}`}
          placeholder="Nom de la catégorie"
        />
        <button
          onClick={handleSave}
          disabled={isSaving || !editedTitle.trim()}
          className="p-2 bg-green-500/80 hover:bg-green-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Enregistrer"
        >
          <Check className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Annuler"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <h2 className={`text-2xl sm:text-3xl font-bold text-white drop-shadow-lg ${className}`}>
        {title}
      </h2>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleStartEdit}
          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          title="Modifier le nom de la catégorie"
        >
          <Pencil className="w-4 h-4 text-white" />
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-all"
            title="Supprimer la catégorie"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  )
}
