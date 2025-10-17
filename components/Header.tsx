'use client'

import { Client } from '@/types'
import AuthButton from './AuthButton'
import { Settings } from 'lucide-react'

interface HeaderProps {
  client: Client
  isEditMode?: boolean
  onEdit?: () => void
}

export default function Header({ client, isEditMode = false, onEdit }: HeaderProps) {
  return (
    <header
      className="relative py-4 md:py-8 px-4 md:px-6 text-white"
      style={{ backgroundColor: client.header_color }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 md:mb-2">{client.name}</h1>
            <p className="text-sm sm:text-base md:text-lg opacity-90">Bienvenue dans votre guide personnalisé</p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {isEditMode && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 bg-white text-gray-800 px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-gray-100 transition text-sm md:text-base"
              >
                <Settings size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="hidden sm:inline">Paramètres</span>
              </button>
            )}
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  )
}
