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

    const { data, error} = await (supabase
      .from('email_automations') as any)
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

// Type pour l'historique d'automation enrichi
interface AutomationHistoryItem {
  id: string;
  client_id: string;
  automation_type: string;
  email_type: string;
  sent_at: string;
  success: boolean;
  error_message?: string;
  resend_id?: string;
  metadata?: Record<string, unknown>;
  clients?: {
    email: string;
    name: string;
  };
  resend_events?: Array<{ event_type: string; created_at: string }>;
}

/**
 * Récupérer l'historique des envois automatiques avec les événements Resend
 */
export async function getAutomationHistory(limit: number = 50) {
  try {
    await requireAdmin();

    const supabase = await createServerSupabaseClient();

    // 1. Récupérer l'historique des automations
    const { data: historyData, error: historyError } = await (supabase
      .from('automation_history') as any)
      .select(`
        *,
        clients (
          email,
          name
        )
      `)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (historyError) {
      console.error('[GET AUTOMATION HISTORY] Error:', historyError);
      return { success: false, history: [] };
    }

    if (!historyData || historyData.length === 0) {
      return { success: true, history: [] };
    }

    // Cast explicite pour TypeScript
    const typedHistoryData = historyData as AutomationHistoryItem[];

    // 2. Récupérer les événements Resend associés à ces automations
    const historyIds = typedHistoryData.map(h => h.id);
    const { data: eventsData, error: eventsError } = await (supabase
      .from('email_events') as any)
      .select('automation_history_id, event_type, created_at')
      .in('automation_history_id', historyIds)
      .order('created_at', { ascending: true });

    if (eventsError) {
      console.error('[GET AUTOMATION HISTORY] Events error:', eventsError);
      // On continue sans les événements
    }

    // 3. Grouper les événements par automation_history_id
    const eventsByHistory: Record<string, Array<{ event_type: string; created_at: string }>> = {};
    if (eventsData) {
      for (const event of eventsData) {
        if (!eventsByHistory[event.automation_history_id]) {
          eventsByHistory[event.automation_history_id] = [];
        }
        eventsByHistory[event.automation_history_id].push({
          event_type: event.event_type,
          created_at: event.created_at,
        });
      }
    }

    // 4. Enrichir l'historique avec les événements
    const enrichedHistory = typedHistoryData.map(item => ({
      ...item,
      resend_events: eventsByHistory[item.id] || [],
    }));

    return { success: true, history: enrichedHistory };
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
