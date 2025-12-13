import { NextRequest, NextResponse } from 'next/server'
import { getCacheStats, cleanExpiredCache } from '@/lib/smartfill-cache'

export const dynamic = 'force-dynamic'

/**
 * GET /api/smartfill/cache-stats
 * Retourne les statistiques d'utilisation du cache SmartFill
 */
export async function GET(request: NextRequest) {
  try {
    const stats = await getCacheStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching cache stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cache statistics' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/smartfill/cache-stats
 * Nettoie les entrées expirées du cache
 */
export async function DELETE(request: NextRequest) {
  try {
    const deletedCount = await cleanExpiredCache()
    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Supprimé ${deletedCount} entrée(s) expirée(s)`,
    })
  } catch (error) {
    console.error('Error cleaning cache:', error)
    return NextResponse.json(
      { error: 'Failed to clean cache' },
      { status: 500 }
    )
  }
}
