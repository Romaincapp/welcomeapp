'use client'

import { Client, FooterButton } from '@/types'
import { Mail, Phone, Globe, Facebook, Instagram } from 'lucide-react'

interface FooterProps {
  client: Client
  buttons: FooterButton[]
  isEditMode?: boolean
  onEdit?: () => void
}

export default function Footer({ client, buttons, isEditMode = false, onEdit }: FooterProps) {
  const contactIcons = {
    email: <Mail className="w-5 h-5" />,
    phone: <Phone className="w-5 h-5" />,
    website: <Globe className="w-5 h-5" />,
    facebook: <Facebook className="w-5 h-5" />,
    instagram: <Instagram className="w-5 h-5" />,
  }

  return (
    <footer
      className="py-6 sm:py-8 px-4 sm:px-6 text-white"
      style={{ backgroundColor: client.footer_color }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Boutons personnalisés */}
        {buttons.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Besoin d'aide ?</h3>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
              {buttons
                .sort((a, b) => a.order - b.order)
                .map((button) => (
                  <a
                    key={button.id}
                    href={button.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition active:scale-95 text-sm sm:text-base"
                  >
                    <span className="text-xl sm:text-2xl">{button.emoji}</span>
                    <span className="truncate">{button.label}</span>
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* Informations de contact */}
        <div className="border-t border-white border-opacity-20 pt-4 sm:pt-6">
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm opacity-90">
            {client.footer_contact_email && (
              <a
                href={`mailto:${client.footer_contact_email}`}
                className="flex items-center gap-1.5 sm:gap-2 hover:opacity-100 min-w-0"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">{client.footer_contact_email}</span>
              </a>
            )}
            {client.footer_contact_phone && (
              <a
                href={`tel:${client.footer_contact_phone}`}
                className="flex items-center gap-1.5 sm:gap-2 hover:opacity-100"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>{client.footer_contact_phone}</span>
              </a>
            )}
            {client.footer_contact_website && (
              <a
                href={client.footer_contact_website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 sm:gap-2 hover:opacity-100"
              >
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Site web</span>
              </a>
            )}
            {client.footer_contact_facebook && (
              <a
                href={client.footer_contact_facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 sm:gap-2 hover:opacity-100"
              >
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Facebook</span>
              </a>
            )}
            {client.footer_contact_instagram && (
              <a
                href={client.footer_contact_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 sm:gap-2 hover:opacity-100"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Instagram</span>
              </a>
            )}
          </div>
        </div>

        {isEditMode && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white border-opacity-20">
            <button
              onClick={onEdit}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition active:scale-95 text-sm sm:text-base w-full sm:w-auto"
            >
              Éditer le footer
            </button>
          </div>
        )}
      </div>
    </footer>
  )
}
