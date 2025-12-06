'use server';

import { requireAdmin } from '@/lib/auth/admin';
import { APP_FEATURES, type AppFeature } from '@/lib/data/app-features';

// Re-export type for convenience
export type { AppFeature } from '@/lib/data/app-features';

/**
 * Récupère toutes les fonctionnalités de l'app
 */
export async function getAppFeatures(): Promise<{
  success: boolean;
  features?: AppFeature[];
  error?: string;
}> {
  await requireAdmin();

  // Trier : nouvelles en premier, puis par catégorie
  const sortedFeatures = [...APP_FEATURES].sort((a, b) => {
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    return a.category.localeCompare(b.category);
  });

  return { success: true, features: sortedFeatures };
}

export interface UpdateSelection {
  id: string;
  title: string;
  description: string;
  emoji?: string;
}

/**
 * Prépare les données pour l'envoi de campagne avec les features sélectionnées
 */
export async function prepareFeaturesCampaign(
  selectedFeatures: UpdateSelection[]
): Promise<{
  success: boolean;
  campaignData?: {
    updates: UpdateSelection[];
    subject: string;
    previewText: string;
  };
  error?: string;
}> {
  await requireAdmin();

  if (selectedFeatures.length === 0) {
    return { success: false, error: 'Aucune fonctionnalité sélectionnée' };
  }

  const count = selectedFeatures.length;
  const subject = count === 1
    ? `${selectedFeatures[0].emoji || '🚀'} Découvrez : ${selectedFeatures[0].title}`
    : `🚀 ${count} fonctionnalités à découvrir sur WelcomeApp !`;

  const previewText = count === 1
    ? selectedFeatures[0].description
    : `Focus sur : ${selectedFeatures.slice(0, 3).map(f => f.title).join(', ')}...`;

  return {
    success: true,
    campaignData: {
      updates: selectedFeatures,
      subject,
      previewText,
    },
  };
}
