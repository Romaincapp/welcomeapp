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
      className="py-8 px-6 text-white"
      style={{ backgroundColor: client.footer_color }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Boutons personnalisés */}
        {buttons.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Besoin d'aide ?</h3>
            <div className="flex flex-wrap gap-3">
              {buttons
                .sort((a, b) => a.order - b.order)
                .map((button) => (
                  <a
                    key={button.id}
                    href={button.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition"
                  >
                    <span className="text-2xl">{button.emoji}</span>
                    <span>{button.label}</span>
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* Informations de contact */}
        <div className="border-t border-white border-opacity-20 pt-6">
          <div className="flex flex-wrap gap-4 text-sm opacity-90">
            {client.footer_contact_email && (
              <a
                href={`mailto:${client.footer_contact_email}`}
                className="flex items-center gap-2 hover:opacity-100"
              >
                {contactIcons.email}
                <span>{client.footer_contact_email}</span>
              </a>
            )}
            {client.footer_contact_phone && (
              <a
                href={`tel:${client.footer_contact_phone}`}
                className="flex items-center gap-2 hover:opacity-100"
              >
                {contactIcons.phone}
                <span>{client.footer_contact_phone}</span>
              </a>
            )}
            {client.footer_contact_website && (
              <a
                href={client.footer_contact_website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-100"
              >
                {contactIcons.website}
                <span>Site web</span>
              </a>
            )}
            {client.footer_contact_facebook && (
              <a
                href={client.footer_contact_facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-100"
              >
                {contactIcons.facebook}
                <span>Facebook</span>
              </a>
            )}
            {client.footer_contact_instagram && (
              <a
                href={client.footer_contact_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-100"
              >
                {contactIcons.instagram}
                <span>Instagram</span>
              </a>
            )}
          </div>
        </div>

        {isEditMode && (
          <div className="mt-6 pt-6 border-t border-white border-opacity-20">
            <button
              onClick={onEdit}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Éditer le footer
            </button>
          </div>
        )}
      </div>
    </footer>
  )
}
