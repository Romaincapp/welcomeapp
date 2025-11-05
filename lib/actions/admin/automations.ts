'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

/**
 * Récupérer toutes les automatisations
 */
export async function getAutomations() {
  try {
    await requireAdmin();

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('email_automations')
      .select('*')
      .order('automation_type', { ascending: true });

    if (error) {
      console.error('[GET AUTOMATIONS] Error:', error);
      return { success: false, error: error.message, automations: [] };
    }

    return { success: true, automations: data || [] };
  } catch (error) {
    console.error('[GET AUTOMATIONS] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      automations: [],
    };
  }
}

/**
 * Mettre à jour une automation (activer/désactiver ou modifier config)
 */
export async function updateAutomation({
  automationType,
  isEnabled,
  config,
}: {
  automationType: string;
  isEnabled?: boolean;
  config?: any;
}) {
  try {
    await requireAdmin();

    const supabase = await createServerSupabaseClient();

    const updateData: any = {};
    if (isEnabled !== undefined) updateData.is_enabled = isEnabled;
    if (config !== undefined) updateData.config = config;

    const { data, error} = await supabase
      .from('email_automations')
      .update(updateData)
      .eq('automation_type', automationType)
      .select()
      .single();

    if (error) {
      console.error('[UPDATE AUTOMATION] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, automation: data };
  } catch (error) {
    console.error('[UPDATE AUTOMATION] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Récupérer les statistiques des automatisations
 */
export async function getAutomationStats() {
  try {
    await requireAdmin();

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('automation_stats' as any)
      .select('*');

    if (error) {
      console.error('[GET AUTOMATION STATS] Error:', error);
      return { success: false, stats: [] };
    }

    return { success: true, stats: data || [] };
  } catch (error) {
    console.error('[GET AUTOMATION STATS] Error:', error);
    return { success: false, stats: [] };
  }
}

/**
 * Récupérer l'historique des envois automatiques
 */
export async function getAutomationHistory(limit: number = 50) {
  try {
    await requireAdmin();

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('automation_history')
      .select(`
        *,
        clients (
          email,
          name
        )
      `)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[GET AUTOMATION HISTORY] Error:', error);
      return { success: false, history: [] };
    }

    return { success: true, history: data || [] };
  } catch (error) {
    console.error('[GET AUTOMATION HISTORY] Error:', error);
    return { success: false, history: [] };
  }
}

/**
 * Déclencher manuellement le cron job (pour tests)
 */
export async function triggerAutomationsCron() {
  try {
    await requireAdmin();

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return {
        success: false,
        error: 'CRON_SECRET not configured',
      };
    }

    const response = await fetch(`${baseUrl}/api/cron/email-automations`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to trigger cron job',
      };
    }

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('[TRIGGER CRON] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
