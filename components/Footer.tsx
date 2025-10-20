'use client'

import { Client } from '@/types'
import { Mail, Phone, Globe, Facebook, Instagram, MessageCircle, Share2 } from 'lucide-react'
import { useState } from 'react'
import ShareModal from './ShareModal'

interface FooterProps {
  client: Client
  isEditMode?: boolean
  onEdit?: () => void
}

export default function Footer({ client, isEditMode = false, onEdit }: FooterProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Construire l'URL complète du welcomeapp
  const welcomebookUrl = typeof window !== 'undefined' ? window.location.href : `https://welcomeapp.be/${client.slug}`

  // Couleur du thème en version claire pour les boutons
  const themeColor = client.header_color || '#4F46E5'

  // Boutons de contact avec icônes Lucide (tous avec la couleur du thème)
  const contactButtons = [
    client.footer_contact_phone && {
      icon: <MessageCircle className="w-5 h-5" />,
      label: 'SMS',
      href: `sms:${client.footer_contact_phone}`,
    },
    client.footer_contact_phone && {
      icon: <Phone className="w-5 h-5" />,
      label: 'Appeler',
      href: `tel:${client.footer_contact_phone}`,
    },
    client.footer_contact_email && {
      icon: <Mail className="w-5 h-5" />,
      label: 'Mail',
      href: `mailto:${client.footer_contact_email}`,
    },
    client.footer_contact_website && {
      icon: <Globe className="w-5 h-5" />,
      label: 'Site',
      href: client.footer_contact_website,
    },
    client.footer_contact_facebook && {
      icon: <Facebook className="w-5 h-5" />,
      label: 'Facebook',
      href: client.footer_contact_facebook,
    },
    client.footer_contact_instagram && {
      icon: <Instagram className="w-5 h-5" />,
      label: 'Instagram',
      href: client.footer_contact_instagram,
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      label: 'Partager',
      onClick: () => setIsShareModalOpen(true),
    },
  ].filter(Boolean) as Array<{
    icon: React.ReactNode
    label: string
    href?: string
    onClick?: () => void
  }>

  return (
    <>
      <footer
        className="py-6 sm:py-8 px-4 sm:px-6 text-white"
        style={{ backgroundColor: client.footer_color }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Conteneur pub iframe */}
          {client.ad_iframe_url && (
            <div className="mb-6 sm:mb-8 rounded-xl overflow-hidden bg-white shadow-lg">
              <iframe
                src={client.ad_iframe_url}
                className="w-full h-32 sm:h-40 border-0"
                title="Publicité"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          )}

          {/* Barre de boutons ronds et sobres avec couleur du thème */}
          <div className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap mb-6">
            {contactButtons.map((button, index) => (
              <div key={index} className="flex flex-col items-center gap-1.5">
                {button.href ? (
                  <a
                    href={button.href}
                    target={button.href.startsWith('http') ? '_blank' : undefined}
                    rel={button.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-transform"
                    style={{ backgroundColor: `${themeColor}cc` }}
                  >
                    {button.icon}
                  </a>
                ) : (
                  <button
                    onClick={button.onClick}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-transform"
                    style={{ backgroundColor: `${themeColor}cc` }}
                  >
                    {button.icon}
                  </button>
                )}
                <span className="text-xs font-medium opacity-90">{button.label}</span>
              </div>
            ))}
          </div>

          {/* Bouton édition mode */}
          {isEditMode && (
            <div className="mb-6 text-center">
              <button
                onClick={onEdit}
                className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition active:scale-95 text-sm sm:text-base shadow-lg"
              >
                Éditer le footer et la pub
              </button>
            </div>
          )}

          {/* Powered by welcomeapp */}
          <div className="text-center border-t border-white border-opacity-20 pt-4">
            <a
              href="/"
              className="text-xs opacity-70 hover:opacity-100 transition-opacity hover:underline"
            >
              Powered by welcomeapp
            </a>
          </div>
        </div>
      </footer>

      {/* Modale de partage */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        welcomebookUrl={welcomebookUrl}
        clientName={client.name}
      />
    </>
  )
}
