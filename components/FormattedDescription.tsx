'use client'

import React from 'react'

interface FormattedDescriptionProps {
  text: string
  className?: string
  /** Mode compact pour TipCard (pas de titres, juste texte) */
  compact?: boolean
  /** Couleur pour le texte mis en évidence avec ==texte== */
  highlightColor?: string
}

/**
 * Composant pour afficher du texte avec formatage basique :
 * - Sauts de ligne préservés
 * - **bold** → gras
 * - *italique* → italique
 * - ==highlight== → texte en couleur (highlightColor)
 * - ## Titre → titre (uniquement en mode non-compact)
 *
 * Compatible avec les descriptions de tips générées manuellement ou par IA
 */
export function FormattedDescription({ text, className = '', compact = false, highlightColor = '#4F46E5' }: FormattedDescriptionProps) {
  if (!text) return null

  // Parser le texte en éléments React
  const parseText = (input: string): React.ReactNode[] => {
    const lines = input.split('\n')
    const elements: React.ReactNode[] = []

    lines.forEach((line, lineIndex) => {
      // Ajouter un saut de ligne entre les lignes (sauf la première)
      if (lineIndex > 0) {
        elements.push(<br key={`br-${lineIndex}`} />)
      }

      // Ligne vide = juste le br
      if (line.trim() === '') {
        return
      }

      // Détecter les titres ## (uniquement en mode non-compact)
      if (!compact) {
        const h2Match = line.match(/^##\s+(.+)$/)
        if (h2Match) {
          elements.push(
            <span key={`h2-${lineIndex}`} className="block text-lg font-bold mt-3 mb-1">
              {parseInlineFormatting(h2Match[1], lineIndex)}
            </span>
          )
          return
        }

        const h1Match = line.match(/^#\s+(.+)$/)
        if (h1Match) {
          elements.push(
            <span key={`h1-${lineIndex}`} className="block text-xl font-bold mt-4 mb-2">
              {parseInlineFormatting(h1Match[1], lineIndex)}
            </span>
          )
          return
        }
      }

      // Parser le formatage inline (bold, italique)
      elements.push(
        <React.Fragment key={`line-${lineIndex}`}>
          {parseInlineFormatting(line, lineIndex)}
        </React.Fragment>
      )
    })

    return elements
  }

  // Parser le formatage inline : **bold**, *italique*, ==highlight==
  const parseInlineFormatting = (text: string, lineIndex: number): React.ReactNode[] => {
    const result: React.ReactNode[] = []

    // Regex pour capturer **bold**, ==highlight==, *italique*, ou texte normal
    // Ordre important : **bold** et ==highlight== avant *italique* car ** contient *
    const regex = /(\*\*(.+?)\*\*)|(==(.+?)==)|(\*(.+?)\*)|([^*=]+|[*=])/g
    let match
    let segmentIndex = 0

    while ((match = regex.exec(text)) !== null) {
      const key = `${lineIndex}-${segmentIndex}`

      if (match[1]) {
        // **bold**
        result.push(
          <strong key={key} className="font-semibold">
            {match[2]}
          </strong>
        )
      } else if (match[3]) {
        // ==highlight==
        result.push(
          <span key={key} className="font-semibold" style={{ color: highlightColor }}>
            {match[4]}
          </span>
        )
      } else if (match[5]) {
        // *italique*
        result.push(
          <em key={key} className="italic">
            {match[6]}
          </em>
        )
      } else if (match[7]) {
        // Texte normal
        result.push(<React.Fragment key={key}>{match[7]}</React.Fragment>)
      }

      segmentIndex++
    }

    return result
  }

  return (
    <span className={className}>
      {parseText(text)}
    </span>
  )
}
