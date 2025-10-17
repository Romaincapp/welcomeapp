'use client'

import { useState } from 'react'
import SecureAccessForm from './SecureAccessForm'
import SecureSectionContent from './SecureSectionContent'

interface SecureSectionProps {
  clientId: string
  hasSecureSection: boolean
}

export default function SecureSection({ clientId, hasSecureSection }: SecureSectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [secureData, setSecureData] = useState<any>(null)

  if (!hasSecureSection) {
    return null
  }

  const handleAccessGranted = (data: any) => {
    setSecureData(data)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setSecureData(null)
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {!isAuthenticated ? (
          <SecureAccessForm clientId={clientId} onAccessGranted={handleAccessGranted} />
        ) : (
          <SecureSectionContent data={secureData} onLogout={handleLogout} />
        )}
      </div>
    </div>
  )
}
