'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { ChecklistItem } from '@/types'
import { type Locale } from '@/i18n/request'

interface InteractiveChecklistProps {
  items: ChecklistItem[]
  clientId: string
  locale?: Locale
}

export default function InteractiveChecklist({ items, clientId, locale = 'fr' }: InteractiveChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  // Load checked state from localStorage on mount
  useEffect(() => {
    const storageKey = `checklist_${clientId}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setCheckedItems(new Set(parsed))
      } catch (e) {
        console.error('Error parsing stored checklist:', e)
      }
    }
  }, [clientId])

  // Save checked state to localStorage whenever it changes
  useEffect(() => {
    const storageKey = `checklist_${clientId}`
    localStorage.setItem(storageKey, JSON.stringify(Array.from(checkedItems)))
  }, [checkedItems, clientId])

  const toggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId)
    } else {
      newChecked.add(itemId)
    }
    setCheckedItems(newChecked)
  }

  const getLocalizedLabel = (item: ChecklistItem): string => {
    if (locale === 'fr') return item.label

    const localeKey = `label_${locale}` as keyof ChecklistItem
    const localizedLabel = item[localeKey]

    return typeof localizedLabel === 'string' ? localizedLabel : item.label
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Aucune tâche dans la checklist.
      </p>
    )
  }

  const completedCount = checkedItems.size
  const totalCount = items.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="bg-gray-100 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progression
          </span>
          <span className="text-sm font-semibold text-indigo-600">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item) => {
          const isChecked = checkedItems.has(item.id)
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                isChecked
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {isChecked ? (
                <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <span
                className={`text-left text-sm ${
                  isChecked
                    ? 'text-indigo-700 line-through'
                    : 'text-gray-800'
                }`}
              >
                {getLocalizedLabel(item)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Completion message */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-sm font-medium text-green-800">
            ✅ Checklist complétée ! Vous êtes prêt pour le départ.
          </p>
        </div>
      )}
    </div>
  )
}
