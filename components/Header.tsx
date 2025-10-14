'use client'

import { Client } from '@/types'

interface HeaderProps {
  client: Client
  isEditMode?: boolean
  onEdit?: () => void
}

export default function Header({ client, isEditMode = false, onEdit }: HeaderProps) {
  return (
    <header
      className="relative py-8 px-6 text-white"
      style={{ backgroundColor: client.header_color }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{client.name}</h1>
            <p className="text-lg opacity-90">Bienvenue dans votre guide personnalisé</p>
          </div>
          {isEditMode && (
            <button
              onClick={onEdit}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Éditer le header
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
