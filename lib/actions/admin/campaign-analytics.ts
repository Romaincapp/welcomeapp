'use server';

import { requireAdmin } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
export async function getAllCampaignsAnalytics() {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('campaign_analytics' as any)
    .select('*')
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('[CAMPAIGNS ANALYTICS] Error fetching all analytics:', error);
    return { success: false, error: error.message };
  }

  return { success: true, campaigns: data };
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
