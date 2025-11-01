'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import { locales, localeLabels, localeFlags, type Locale } from '@/i18n/request'

interface LanguageSelectorProps {
  currentLocale: Locale
  onLocaleChange: (locale: Locale) => void
}

export default function LanguageSelector({
  currentLocale,
  onLocaleChange
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 h-9 px-2 sm:px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Select language"
      >
        <Globe size={18} className="sm:hidden" />
        <span className="text-lg sm:text-base font-medium">
          {localeFlags[currentLocale]}
        </span>
        <span className="hidden sm:inline text-sm font-medium">
          {localeLabels[currentLocale]}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => {
                  onLocaleChange(locale)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-3 ${
                  locale === currentLocale ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{localeFlags[locale]}</span>
                <span className="font-medium">{localeLabels[locale]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
