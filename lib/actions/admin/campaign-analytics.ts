'use server';

import { requireAdmin } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Type pour les analytics d'une campagne (depuis la vue SQL campaign_analytics)
 */
export interface CampaignAnalytics {
  campaign_id: string;
  subject: string;
  segment: string;
  template_type: string;
  sent_at: string;
  total_recipients: number;
  total_sent: number;
  total_failed: number;
  ab_test_enabled: boolean;
  ab_test_variant: string | null;
  ab_test_winner: string | null;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_complained: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}

/**
 * Récupérer les analytics d'une campagne
 * Utilise la vue SQL `campaign_analytics` qui agrège les stats
 */
export async function getCampaignAnalytics(campaignId: string) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  // Récupérer depuis la vue campaign_analytics
  const { data, error } = await supabase
    .from('campaign_analytics' as any)
    .select('*')
    .eq('campaign_id', campaignId)
    .maybeSingle();

  if (error) {
    console.error('[CAMPAIGN ANALYTICS] Error fetching analytics:', error);
    return { success: false, error: error.message };
  }

  return { success: true, analytics: data };
}

/**
 * Récupérer la comparaison A/B test pour une campagne
 * Utilise la vue SQL `ab_test_comparison`
 */
export async function getABTestComparison(campaignId: string) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('ab_test_comparison' as any)
    .select('*')
    .eq('campaign_id', campaignId)
    .maybeSingle();

  if (error) {
    console.error('[AB TEST] Error fetching comparison:', error);
    return { success: false, error: error.message };
  }

  return { success: true, comparison: data };
}

/**
 * Récupérer tous les événements email d'une campagne (opens, clicks, etc.)
 */
export async function getCampaignEvents(campaignId: string, limit = 100) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('email_events')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[CAMPAIGN EVENTS] Error fetching events:', error);
    return { success: false, error: error.message };
  }

  return { success: true, events: data };
}

/**
 * Calculer le winner d'un A/B test
 * Appelle la fonction SQL `calculate_ab_test_winner` qui compare les taux d'ouverture
 */
export async function calculateABTestWinner(campaignId: string) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase.rpc('calculate_ab_test_winner', {
      p_campaign_id: campaignId,
    });

    if (error) {
      console.error('[AB TEST] Error calculating winner:', error);
      return { success: false, error: error.message };
    }

    return { success: true, winner: data };
  } catch (error) {
    console.error('[AB TEST] Error:', error);
    return { success: false, error: 'Failed to calculate winner' };
  }
}

/**
 * Récupérer les analytics de toutes les campagnes (overview)
 */
export async function getAllCampaignsAnalytics(): Promise<CampaignAnalytics[]> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('campaign_analytics' as any)
    .select('*')
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('[CAMPAIGNS ANALYTICS] Error fetching all analytics:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data as unknown as CampaignAnalytics[];
}

/**
 * Récupérer les statistiques globales des campagnes email
 */
export async function getCampaignsOverviewStats() {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  const { data: campaigns, error } = await supabase
    .from('campaign_analytics' as any)
    .select('*');

  if (error) {
    console.error('[CAMPAIGNS STATS] Error fetching stats:', error);
    return { success: false, error: error.message };
  }

  if (!campaigns || campaigns.length === 0) {
    return {
      success: true,
      stats: {
        totalCampaigns: 0,
        totalSent: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
        totalOpened: 0,
        totalClicked: 0,
      },
    };
  }

  // Calculer les stats globales
  const stats = {
    totalCampaigns: campaigns.length,
    totalSent: campaigns.reduce((sum: number, c: any) => sum + (c.total_sent || 0), 0),
    totalOpened: campaigns.reduce((sum: number, c: any) => sum + (c.total_opened || 0), 0),
    totalClicked: campaigns.reduce((sum: number, c: any) => sum + (c.total_clicked || 0), 0),
    averageOpenRate:
      campaigns.reduce((sum: number, c: any) => sum + (c.open_rate || 0), 0) / campaigns.length,
    averageClickRate:
      campaigns.reduce((sum: number, c: any) => sum + (c.click_rate || 0), 0) / campaigns.length,
  };

  return { success: true, stats };
}

/**
 * Récupérer les top campaigns par taux d'ouverture
 */
export async function getTopCampaignsByOpenRate(limit = 5) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('campaign_analytics' as any)
    .select('*')
    .order('open_rate', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[TOP CAMPAIGNS] Error fetching top campaigns:', error);
    return { success: false, error: error.message };
  }

  return { success: true, campaigns: data };
}

/**
 * Récupérer la timeline des événements pour une campagne
 * (pour afficher l'historique détaillé : sent, delivered, opened, clicked, etc.)
 */
export async function getCampaignEventsTimeline(campaignId: string, limit = 50) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  const { data: events, error } = await supabase
    .from('email_events')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[CAMPAIGN EVENTS] Error fetching events:', error);
    return { success: false, error: error.message };
  }

  // Enrichir les événements avec des données d'affichage
  const enrichedEvents = events.map((event: any) => {
    // Calculer le temps relatif (ex: "il y a 2h")
    const createdDate = new Date(event.created_at);
    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let relativeTime = '';
    if (diffMins < 1) {
      relativeTime = "à l'instant";
    } else if (diffMins < 60) {
      relativeTime = `il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      relativeTime = `il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      relativeTime = `il y a ${diffDays}j`;
    } else {
      relativeTime = createdDate.toLocaleDateString('fr-FR');
    }

    // Couleur de l'icône selon le type d'événement
    const iconColors: Record<string, string> = {
      sent: 'text-gray-500',
      delivered: 'text-green-500',
      opened: 'text-blue-500',
      clicked: 'text-orange-500',
      bounced: 'text-red-500',
      complained: 'text-red-700',
      delivery_delayed: 'text-yellow-500',
    };

    return {
      ...event,
      relative_time: relativeTime,
      icon_color: iconColors[event.event_type] || 'text-gray-400',
    };
  });

  return {
    success: true,
    events: enrichedEvents,
    total_count: events.length,
  };
}

/**
 * Récupérer les performances des campagnes au fil du temps
 * (pour les graphiques d'évolution temporelle)
 *
 * @param period - Période à analyser : '7d', '30d', '90d', ou 'all'
 */
export async function getCampaignsPerformanceOverTime(
  period: '7d' | '30d' | '90d' | 'all' = '30d'
) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  // Calculer la date de début selon la période
  let startDate: Date;
  const now = new Date();

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
      startDate = new Date(0); // Début de l'époque Unix
      break;
  }

  // Récupérer toutes les campagnes dans la période
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaign_analytics' as any)
    .select('*')
    .gte('sent_at', startDate.toISOString())
    .order('sent_at', { ascending: true });

  if (campaignsError) {
    console.error('[PERFORMANCE OVER TIME] Error fetching campaigns:', campaignsError);
    return { success: false, error: campaignsError.message };
  }

  if (!campaigns || campaigns.length === 0) {
    return {
      success: true,
      period,
      data: [],
    };
  }

  // Grouper par jour et calculer les métriques
  const dataByDate: Record<string, {
    date: string;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
    campaigns_count: number;
  }> = {};

  campaigns.forEach((campaign: any) => {
    const date = new Date(campaign.sent_at).toISOString().split('T')[0]; // Format YYYY-MM-DD

    if (!dataByDate[date]) {
      dataByDate[date] = {
        date,
        total_sent: 0,
        total_opened: 0,
        total_clicked: 0,
        campaigns_count: 0,
      };
    }

    dataByDate[date].total_sent += campaign.total_sent || 0;
    dataByDate[date].total_opened += campaign.total_opened || 0;
    dataByDate[date].total_clicked += campaign.total_clicked || 0;
    dataByDate[date].campaigns_count += 1;
  });

  // Convertir en array et calculer les taux
  const performanceData = Object.values(dataByDate).map((day) => ({
    date: day.date,
    total_sent: day.total_sent,
    total_opened: day.total_opened,
    total_clicked: day.total_clicked,
    open_rate: day.total_sent > 0 ? (day.total_opened / day.total_sent) * 100 : 0,
    click_rate: day.total_sent > 0 ? (day.total_clicked / day.total_sent) * 100 : 0,
  }));

  // Trier par date
  performanceData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    success: true,
    period,
    data: performanceData,
  };
}
