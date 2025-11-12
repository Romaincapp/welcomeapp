import { useState, useEffect, useCallback } from 'react'

interface UseFavoritesReturn {
  favorites: Set<string>
  toggleFavorite: (tipId: string) => void
  isFavorite: (tipId: string) => boolean
  favoritesCount: number
}

/**
 * Hook personnalisé pour gérer les favoris des tips via localStorage
 * Les favoris sont persistés localement par welcomebook (slug)
 *
 * @param clientSlug - Slug unique du welcomebook
 * @returns Méthodes et état pour gérer les favoris
 *
 * @example
 * ```tsx
 * const { favorites, toggleFavorite, isFavorite, favoritesCount } = useFavorites(client.slug)
 *
 * // Vérifier si un tip est favori
 * const isLiked = isFavorite(tip.id)
 *
 * // Toggle un favori
 * <button onClick={() => toggleFavorite(tip.id)}>
 *   {isFavorite(tip.id) ? 'Retirer' : 'Ajouter'}
 * </button>
 * ```
 */
export function useFavorites(clientSlug: string): UseFavoritesReturn {
  const storageKey = `welcomeapp_favorites_${clientSlug}`

  // Initialisation depuis localStorage (SSR-safe)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()

    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error)
      return new Set()
    }
  })

  // Synchronisation avec localStorage à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(favorites)))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des favoris:', error)
    }
  }, [favorites, storageKey])

  // Toggle un favori (ajouter ou retirer)
  const toggleFavorite = useCallback((tipId: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(tipId)) {
        next.delete(tipId)
      } else {
        next.add(tipId)
      }
      return next
    })
  }, [])

  // Vérifier si un tip est favori
  const isFavorite = useCallback((tipId: string): boolean => {
    return favorites.has(tipId)
  }, [favorites])

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    favoritesCount: favorites.size,
  }
}
