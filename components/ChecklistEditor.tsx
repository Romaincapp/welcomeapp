'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { ChecklistItem } from '@/types'

interface ChecklistEditorProps {
  items: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
}

export default function ChecklistEditor({ items, onChange }: ChecklistEditorProps) {
  const [newItemLabel, setNewItemLabel] = useState('')

  const addItem = () => {
    if (!newItemLabel.trim()) return

    const newItem: ChecklistItem = {
      id: `item_${Date.now()}`,
      label: newItemLabel.trim(),
    }

    onChange([...items, newItem])
    setNewItemLabel('')
  }

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id))
  }

  const updateItemLabel = (id: string, label: string) => {
    onChange(items.map(item =>
      item.id === id ? { ...item, label } : item
    ))
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= items.length) return

    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
    onChange(newItems)
  }

  return (
    <div className="space-y-3">
      {/* Liste des items existants */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-gray-50 rounded-lg p-2"
            >
              {/* Drag handle */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Déplacer vers le haut"
                >
                  <GripVertical size={16} className="rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Déplacer vers le bas"
                >
                  <GripVertical size={16} className="-rotate-90" />
                </button>
              </div>

              {/* Input field */}
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItemLabel(item.id, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                placeholder="Libellé de la tâche"
              />

              {/* Delete button */}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ajouter un nouvel item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItemLabel}
          onChange={(e) => setNewItemLabel(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addItem()
            }
          }}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
          placeholder="Ajouter une tâche... (Ex: Éteindre toutes les lumières)"
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!newItemLabel.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Aucune tâche dans la checklist. Ajoutez-en une ci-dessus.
        </p>
      )}
    </div>
  )
}
