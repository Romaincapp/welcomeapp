'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

/**
 * Récupérer toutes les campagnes email (historique)
 */
export async function getCampaigns() {
  try {
    await requireAdmin();

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('[GET CAMPAIGNS] Error:', error);
      return { success: false, error: error.message, campaigns: [] };
    }

    return { success: true, campaigns: data || [] };
  } catch (error) {
    console.error('[GET CAMPAIGNS] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      campaigns: [],
    };
  }
}

/**
 * Récupérer le nombre de destinataires pour un segment donné
 */
export async function getRecipientCount(segment: string) {
  try {
    await requireAdmin();

    const supabase = await createServerSupabaseClient();

    let query;

    if (segment === 'all') {
      query = supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .not('email', 'is', null);
    } else {
      query = supabase
        .from('manager_categories' as any)
        .select('*', { count: 'exact', head: true })
        .eq('category', segment);
    }

    const { count, error } = await query;

    if (error) {
      console.error('[GET RECIPIENT COUNT] Error:', error);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('[GET RECIPIENT COUNT] Error:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Envoyer une campagne email
 */
export async function sendCampaign({
  templateType,
  subject,
  segment,
  testMode = false,
}: {
  templateType: string;
  subject: string;
  segment: string;
  testMode?: boolean;
}) {
  try {
    const adminUser = await requireAdmin();

    console.log(`[SEND CAMPAIGN] Starting campaign: ${templateType} to ${segment}`);

    // Appeler l'API Route pour envoyer les emails
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://nimbzitahumdefggtiob.supabase.co', 'http://localhost:3000')}/api/admin/send-campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateType,
        subject,
        segment,
        testMode,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[SEND CAMPAIGN] API Error:', result);
      return {
        success: false,
        error: result.error || 'Failed to send campaign',
      };
    }

    // Sauvegarder dans l'historique (seulement si pas en mode test)
    if (!testMode) {
      const supabase = await createServerSupabaseClient();

      const { error: saveError } = await supabase.from('email_campaigns').insert({
        template_type: templateType,
        subject,
        segment,
        total_sent: result.totalSent,
        total_failed: result.totalFailed,
        total_recipients: result.totalSent + result.totalFailed,
        sent_by: adminUser.email,
        results: result.results,
      });

      if (saveError) {
        console.error('[SEND CAMPAIGN] Error saving to history:', saveError);
        // Continue anyway, l'email est envoyé même si l'historique ne se sauvegarde pas
      }
    }

    return {
      success: true,
      totalSent: result.totalSent,
      totalFailed: result.totalFailed,
    };
  } catch (error) {
    console.error('[SEND CAMPAIGN] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Récupérer les statistiques des segments
 */
export async function getSegmentStats() {
  try {
    await requireAdmin();

    const supabase = await createServerSupabaseClient();

    // Récupérer les stats de chaque catégorie
    const { data, error } = await supabase
      .from('manager_categories' as any)
      .select('category')
      .not('category', 'is', null);

    if (error) {
      console.error('[GET SEGMENT STATS] Error:', error);
      return { success: false, stats: {} };
    }

    // Compter par catégorie
    const stats: Record<string, number> = {};
    data?.forEach((row: any) => {
      const category = row.category;
      stats[category] = (stats[category] || 0) + 1;
    });

    // Ajouter le total
    const { count } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .not('email', 'is', null);

    stats['all'] = count || 0;

    return { success: true, stats };
  } catch (error) {
    console.error('[GET SEGMENT STATS] Error:', error);
    return { success: false, stats: {} };
  }
}
