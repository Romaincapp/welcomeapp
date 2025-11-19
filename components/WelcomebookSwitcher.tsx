'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Plus, Home, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getClientsByUserId } from '@/lib/actions/client'
import type { Client } from '@/types'

interface WelcomebookSwitcherProps {
  currentClient: Client
  onCreateNew: () => void
}

export default function WelcomebookSwitcher({
  currentClient,
  onCreateNew
}: WelcomebookSwitcherProps) {
  const [welcomebooks, setWelcomebooks] = useState<Client[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Fetch all welcomebooks on mount
  useEffect(() => {
    async function fetchWelcomebooks() {
      setLoading(true)
      const result = await getClientsByUserId()
      if (result.success && result.data) {
        setWelcomebooks(result.data)
      }
      setLoading(false)
    }
    fetchWelcomebooks()
  }, [])

  const handleSwitch = (clientId: string) => {
    // Store selected welcomebook ID in cookie
    document.cookie = `selectedWelcomebookId=${clientId}; path=/; max-age=31536000` // 1 year
    setIsOpen(false)
    // Refresh current page to load new welcomebook
    router.refresh()
  }

  const handleCreateNew = () => {
    setIsOpen(false)
    onCreateNew()
  }

  return (
    <div className="flex items-center gap-2">
      {/* Switcher Dropdown (only if 2+ welcomebooks) */}
      {welcomebooks.length > 1 && (
        <div className="relative">
          {/* Trigger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            aria-label="Changer de welcomebook"
          >
            <Home size={18} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-900 max-w-[120px] truncate">
              {(currentClient as any).welcomebook_name || currentClient.name}
            </span>
            {loading ? (
              <Loader2 size={16} className="text-gray-500 animate-spin" />
            ) : (
              <ChevronDown
                size={16}
                className={`text-gray-500 transition ${isOpen ? 'rotate-180' : ''}`}
              />
            )}
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* Menu */}
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">
                    Mes Welcomebooks ({welcomebooks.length})
                  </p>

                  {/* List of welcomebooks */}
                  {welcomebooks.map((wb) => (
                    <button
                      key={wb.id}
                      onClick={() => handleSwitch(wb.id)}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-indigo-50 transition ${
                        wb.id === currentClient.id
                          ? 'bg-indigo-100 text-indigo-700 font-semibold'
                          : 'text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {(wb as any).welcomebook_name || wb.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            /{wb.slug}
                          </p>
                        </div>
                        {wb.id === currentClient.id && (
                          <div className="ml-2 w-2 h-2 bg-indigo-600 rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Create New Button - Always visible */}
      <button
        onClick={handleCreateNew}
        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
        aria-label="Créer un nouveau welcomebook"
        title="Créer un nouveau welcomebook"
      >
        <Plus size={18} />
        <span className="hidden sm:inline text-sm">Nouveau</span>
      </button>
    </div>
  )
}
