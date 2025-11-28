'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import {
  generateLinkedInDraftUrl,
  generateTwitterDraftUrl,
  generateFacebookDraftUrl,
  getInstagramInstructions,
  copyToClipboard,
  openSocialShareWindow,
} from '@/lib/utils/social-share-urls'

interface SocialShareButtonsProps {
  content: string
  onShare?: (platform: string) => void
}

const PLATFORM_CONFIGS = {
  linkedin: {
    label: 'LinkedIn',
    icon: '🔵',
    color: 'bg-[#0A66C2] hover:bg-[#004182] text-white',
  },
  facebook: {
    label: 'Facebook',
    icon: '📘',
    color: 'bg-[#1877F2] hover:bg-[#0C63D4] text-white',
  },
  twitter: {
    label: 'Twitter/X',
    icon: '🐦',
    color: 'bg-black hover:bg-gray-800 text-white',
  },
  instagram: {
    label: 'Instagram',
    icon: '📸',
    color: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white',
  },
} as const

export default function SocialShareButtons({ content, onShare }: SocialShareButtonsProps) {
  const [copiedInstagram, setCopiedInstagram] = useState(false)

  const handleShare = (platform: keyof typeof PLATFORM_CONFIGS) => {
    switch (platform) {
      case 'linkedin': {
        const url = generateLinkedInDraftUrl(content)
        openSocialShareWindow(url, 'linkedin')
        break
      }
      case 'facebook': {
        const url = generateFacebookDraftUrl('https://welcomeapp.be', content)
        openSocialShareWindow(url, 'facebook')
        break
      }
      case 'twitter': {
        const url = generateTwitterDraftUrl(content)
        openSocialShareWindow(url, 'twitter')
        break
      }
      case 'instagram': {
        const { textToCopy } = getInstagramInstructions(content)
        copyToClipboard(textToCopy).then((success) => {
          if (success) {
            setCopiedInstagram(true)
            setTimeout(() => setCopiedInstagram(false), 3000)
          }
        })
        break
      }
    }

    // Callback pour tracking
    onShare?.(platform)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 font-medium">
        📤 Partager directement :
      </p>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(PLATFORM_CONFIGS).map(([key, config]) => (
          <Button
            key={key}
            onClick={() => handleShare(key as keyof typeof PLATFORM_CONFIGS)}
            className={`${config.color} font-medium transition-all duration-200 active:scale-95`}
            size="lg"
          >
            <span className="text-lg mr-2">{config.icon}</span>
            {key === 'instagram' ? (
              copiedInstagram ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </>
              )
            ) : (
              config.label
            )}
          </Button>
        ))}
      </div>

      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800 flex items-start gap-2">
          <span className="text-base">💡</span>
          <span>
            <strong>LinkedIn, Facebook, Twitter :</strong> Le compositeur s'ouvre avec le texte pré-rempli. Vous pouvez personnaliser avant de publier.
            <br />
            <strong>Instagram :</strong> Le texte est copié dans votre presse-papiers. Collez-le dans l'app Instagram.
          </span>
        </p>
      </div>
    </div>
  )
}
