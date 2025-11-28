'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import ShareWelcomeBookModal from '@/components/ShareWelcomeBookModal'
import QRCodeDesignerModal from '@/components/QRCodeDesignerModal'
import EditSlugModal from '@/components/EditSlugModal'
import type { Client } from '@/types'

interface DashboardContextValue {
  openShareModal: () => void
  openQRModal: () => void
  openEditSlugModal: () => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

interface DashboardProviderProps {
  children: ReactNode
  client: Client
}

export function DashboardProvider({ children, client }: DashboardProviderProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showEditSlugModal, setShowEditSlugModal] = useState(false)

  const subdomain = client.subdomain || client.slug

  const value: DashboardContextValue = {
    openShareModal: () => setShowShareModal(true),
    openQRModal: () => setShowQRModal(true),
    openEditSlugModal: () => setShowEditSlugModal(true),
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}

      {/* Share Modal */}
      <ShareWelcomeBookModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        subdomain={subdomain}
        clientName={client.name}
        clientId={client.id}
      />

      {/* Edit Slug Modal */}
      <EditSlugModal
        isOpen={showEditSlugModal}
        onClose={() => setShowEditSlugModal(false)}
        currentSlug={subdomain}
        clientId={client.id}
        clientName={client.name}
      />

      {/* QR Code Designer Modal */}
      {showQRModal && (
        <QRCodeDesignerModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          client={client}
          welcomebookUrl={`https://welcomeapp.be/${subdomain}`}
        />
      )}
    </DashboardContext.Provider>
  )
}
