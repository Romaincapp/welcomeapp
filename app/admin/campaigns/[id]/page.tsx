import { notFound } from 'next/navigation';
import {
  getCampaignAnalytics,
  getCampaignEventsTimeline,
  getABTestComparison,
} from '@/lib/actions/admin/campaign-analytics';
import { CampaignDetailsClient } from './CampaignDetailsClient';

export const metadata = {
  title: 'Détails Campagne | Admin WelcomeApp',
  description: 'Détails et analytics d\'une campagne email',
};

interface CampaignDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  // Next.js 16 : params est une Promise
  const { id } = await params;

  // Récupérer les analytics de la campagne
  const analyticsResult = await getCampaignAnalytics(id);

  if (!analyticsResult.success || !analyticsResult.analytics) {
    notFound();
  }

  // Récupérer la timeline des événements
  const timelineResult = await getCampaignEventsTimeline(id, 100);
  const events = timelineResult.success ? timelineResult.events || [] : [];

  // Récupérer la comparaison A/B si applicable
  let abTestComparison = null;
  const analytics = analyticsResult.analytics;
  if (analytics && 'ab_test_enabled' in analytics && analytics.ab_test_enabled) {
    const abResult = await getABTestComparison(id);
    if (abResult.success) {
      abTestComparison = abResult.comparison;
    }
  }

  return (
    <CampaignDetailsClient
      campaignId={id}
      analytics={analyticsResult.analytics as any}
      events={events}
      abTestComparison={abTestComparison as any}
    />
  );
}
