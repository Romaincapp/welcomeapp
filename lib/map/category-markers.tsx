// Mapping catégorie → icône SVG path + couleur
// Paths SVG extraits de Material Design Icons

interface CategoryStyle {
  iconPath: string
  color: string
  label: string
}

// Paths SVG Material Design (viewBox 0 0 24 24)
const ICON_PATHS = {
  restaurant: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',
  bar: 'M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM7.43 7L5.66 5h12.69l-1.78 2H7.43z',
  beach: 'M13.127 14.56l1.43-1.43 6.44 6.443L19.57 21l-6.443-6.44zm-8.56-2.127c.325-.15.675-.227 1.033-.227.32 0 .627.06.912.168l-1.946-1.946-.001-.001c-.252-.251-.614-.332-.945-.23l-.3.093c-.367.113-.635.419-.697.8l-.09.521c-.033.189.024.384.152.527l1.882 2.09V14.22c0-.657.325-1.274.865-1.644l1.163-.81c.232-.162.52-.2.783-.13l-.022-.01a.814.814 0 0 0 .345-.063l.56-.23a.998.998 0 0 0 .587-.768l.06-.418a.984.984 0 0 0-.205-.757l-2.04-2.476a.974.974 0 0 0-.545-.32l-.558-.115a.913.913 0 0 0-.914.33l-.14.17a.81.81 0 0 1-.525.275l-.274.024a1.038 1.038 0 0 0-.88.704l-.192.581a.883.883 0 0 0 .11.747l.065.093a.995.995 0 0 1 .074 1.016l-.353.666c-.186.35-.118.78.17 1.056l.83.83c.045.045.093.085.144.12zm9.816.495a.987.987 0 0 0 .122-.848l-.108-.324a.979.979 0 0 0-.51-.576l-.432-.202a.957.957 0 0 1-.505-.537l-.108-.323a.994.994 0 0 0-.674-.645l-.304-.082a.99.99 0 0 0-.84.182l-.23.172a.963.963 0 0 1-.654.186l-.324-.032a1.004 1.004 0 0 0-.945.503l-.17.303a.854.854 0 0 0-.116.398v.143c0 .17.04.338.12.488l.093.175a.99.99 0 0 0 .718.516l.174.026c.197.03.373.134.495.29l.207.267a.935.935 0 0 1 .174.406l.036.196a.98.98 0 0 0 .506.69l.204.1c.227.112.49.115.72.01l.362-.166a.95.95 0 0 1 .53-.066l.12.019a.993.993 0 0 0 .88-.326l.197-.228c.12-.14.204-.304.245-.48zm-9.99 7.072l6.44-6.44 1.43 1.43-6.44 6.44-1.43-1.43z',
  shopping: 'M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z',
  run: 'M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z',
  hiking: 'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7M13 2l3 3-1.7 1.7L18 10.4V22h2V9.6l-4.3-4.3L13 2z',
  museum: 'M22 11V9L12 2 2 9v2h2v9H2v2h20v-2h-2v-9h2zm-6 9h-2v-4l-2 3-2-3v4H8v-9h2l2 3 2-3h2v9z',
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  build: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  sailing: 'M11 13V4.07c-4.57.5-8 4.38-8 9.04C3 17.95 7.05 22 11.89 22c4.31 0 7.89-3.05 8.73-7.11-1.47.85-3.67 1.47-5.52.91l-5.01-1.46c-.78-.23-1.56.12-1.94.35L11 13zm1-9.92v9.17l.13-.04c1.47-.43 3.29.02 4.75.54l-1.71-6.2L12 3.08z',
  forest: 'M16 12L9 2 2 12h2.8l-2.8 4h3.6l-2.6 4h6V12h7zm5.2 4L18 12l-3 4h1.8l-2.8 4h6l-2.8-4h2z',
  cabin: 'M12 3L4 9v12h16V9l-8-6zm0 2.5L18 10v9h-3v-5h-6v5H6v-9l6-4.5z',
}

export const CATEGORY_MARKERS: Record<string, CategoryStyle> = {
  // Restauration & Bars
  'restaurants': { iconPath: ICON_PATHS.restaurant, color: '#FF6B35', label: 'Restaurants' },
  'bars': { iconPath: ICON_PATHS.bar, color: '#8B5CF6', label: 'Bars' },
  'bar': { iconPath: ICON_PATHS.bar, color: '#8B5CF6', label: 'Bar' },

  // Nature & Plein air
  'nature': { iconPath: ICON_PATHS.forest, color: '#22C55E', label: 'Nature' },
  'sport-nautique': { iconPath: ICON_PATHS.sailing, color: '#0EA5E9', label: 'Sport nautique' },

  // Shopping
  'magasins': { iconPath: ICON_PATHS.shopping, color: '#EC4899', label: 'Magasins' },
  'shopping': { iconPath: ICON_PATHS.shopping, color: '#EC4899', label: 'Shopping' },

  // Activités & Culture
  'activites': { iconPath: ICON_PATHS.run, color: '#F59E0B', label: 'Activités' },
  'randonnee': { iconPath: ICON_PATHS.hiking, color: '#059669', label: 'Randonnée' },
  'culture': { iconPath: ICON_PATHS.museum, color: '#6366F1', label: 'Culture' },
  'insolites': { iconPath: ICON_PATHS.star, color: '#EAB308', label: 'Insolites' },

  // Logement & Infos
  'logement': { iconPath: ICON_PATHS.home, color: '#10B981', label: 'Logement' },
  'informations': { iconPath: ICON_PATHS.info, color: '#64748B', label: 'Informations' },
  'services': { iconPath: ICON_PATHS.build, color: '#78716C', label: 'Services' },

  // Camping & Vacances
  'le-camp': { iconPath: ICON_PATHS.cabin, color: '#84CC16', label: 'Le camp' },
  'pour-ne-rien-rater': { iconPath: ICON_PATHS.beach, color: '#06B6D4', label: 'À ne pas rater' },
}

// Style par défaut si catégorie inconnue
const DEFAULT_STYLE: CategoryStyle = {
  iconPath: ICON_PATHS.star,
  color: '#4F46E5',
  label: 'Autre'
}

export function getCategoryStyle(slug: string | undefined): CategoryStyle {
  if (!slug) return DEFAULT_STYLE
  return CATEGORY_MARKERS[slug] || DEFAULT_STYLE
}

// Assombrit une couleur hex
function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - amount)
  const g = Math.max(0, ((num >> 8) & 0x00FF) - amount)
  const b = Math.max(0, (num & 0x0000FF) - amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// Génère le HTML du marqueur avec l'icône de la catégorie
export function createCategoryMarkerSVG(categorySlug: string | undefined, color: string): string {
  const style = getCategoryStyle(categorySlug)
  // ID stable basé sur le slug uniquement (pas de random)
  const gradientId = `marker-grad-${categorySlug || 'default'}`

  return `
    <div style="position: relative; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
      <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${color}" />
            <stop offset="100%" style="stop-color:${darkenColor(color, 40)}" />
          </linearGradient>
        </defs>
        <!-- Marqueur principal -->
        <path d="M20 0C11.7 0 5 6.7 5 15C5 26.25 20 48 20 48C20 48 35 26.25 35 15C35 6.7 28.3 0 20 0Z"
              fill="url(#${gradientId})"
              stroke="white"
              stroke-width="2.5"/>
        <!-- Cercle intérieur -->
        <circle cx="20" cy="15" r="11" fill="white"/>
        <!-- Icône -->
        <g transform="translate(13, 8) scale(0.58)">
          <path d="${style.iconPath}" fill="${color}"/>
        </g>
      </svg>
    </div>
  `
}

// Retourne toutes les catégories pour une légende
export function getAllCategoryStyles(): Array<{ slug: string } & CategoryStyle> {
  return Object.entries(CATEGORY_MARKERS).map(([slug, style]) => ({
    slug,
    ...style
  }))
}
