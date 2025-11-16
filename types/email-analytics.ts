/**
 * Types TypeScript pour Email Marketing Analytics
 *
 * Ce fichier contient tous les types utilisés pour les analytics des campagnes email,
 * la timeline des événements, et les visualisations du dashboard.
 */

// =====================================================================
// Types pour les événements email
// =====================================================================

export type EmailEventType =
  | 'sent'
  | 'delivered'
  | 'delivery_delayed'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained';

export interface EmailEvent {
  id: string;
  campaign_id: string | null;
  email_id: string;
  recipient_email: string;
  event_type: EmailEventType;
  event_data: Record<string, unknown>;
  created_at: string;
}

// =====================================================================
// Types pour les campagnes
// =====================================================================

export type CampaignTemplateType =
  | 'welcome'
  | 'inactive_reactivation'
  | 'feature_announcement'
  | 'newsletter'
  | 'tips_reminder';

export type CampaignSegment =
  | 'all'
  | 'Inactif'
  | 'Débutant'
  | 'Intermédiaire'
  | 'Avancé'
  | 'Expert';

export interface Campaign {
  id: string;
  template_type: CampaignTemplateType;
  subject: string;
  segment: CampaignSegment;
  total_sent: number;
  total_failed: number;
  total_recipients: number;
  sent_by: string;
  results: Array<{
    email: string;
    status: 'sent' | 'failed';
    id?: string;
    error?: string;
  }>;
  ab_test_enabled: boolean;
  ab_test_variant?: 'A' | 'B';
  ab_test_subject_a?: string;
  ab_test_subject_b?: string;
  ab_test_winner?: 'A' | 'B';
  tracking_data?: Record<string, unknown>;
  sent_at: string;
  created_at: string;
}

// =====================================================================
// Types pour les analytics (depuis les vues SQL)
// =====================================================================

export interface CampaignAnalytics {
  campaign_id: string;
  subject: string;
  segment: CampaignSegment;
  template_type: CampaignTemplateType;
  sent_at: string;
  total_recipients: number;
  total_sent: number;
  total_failed: number;
  ab_test_enabled: boolean;
  ab_test_variant: string | null;
  ab_test_winner: string | null;
  // Métriques calculées depuis email_events
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_complained: number;
  delivery_rate: number; // 0-100
  open_rate: number; // 0-100
  click_rate: number; // 0-100
}

export interface ABTestComparison {
  campaign_id: string;
  subject_a: string;
  subject_b: string;
  variant_a_sent: number;
  variant_a_opened: number;
  variant_a_clicked: number;
  variant_a_open_rate: number;
  variant_a_click_rate: number;
  variant_b_sent: number;
  variant_b_opened: number;
  variant_b_clicked: number;
  variant_b_open_rate: number;
  variant_b_click_rate: number;
  winner: 'A' | 'B' | null;
}

export interface CampaignsOverviewStats {
  total_campaigns: number;
  total_emails_sent: number;
  avg_delivery_rate: number;
  avg_open_rate: number;
  avg_click_rate: number;
  total_bounced: number;
  total_complained: number;
}

// =====================================================================
// Types pour la timeline des événements
// =====================================================================

export interface EmailEventTimeline {
  id: string;
  event_type: EmailEventType;
  recipient_email: string;
  event_data: Record<string, unknown>;
  created_at: string;
  // Données enrichies pour l'affichage
  relative_time: string; // Ex: "il y a 2h", "il y a 3 jours"
  icon_color: string; // Couleur de l'icône selon event_type
}

// =====================================================================
// Types pour les graphiques (performance temporelle)
// =====================================================================

export interface CampaignPerformanceDataPoint {
  date: string; // Format: YYYY-MM-DD
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  open_rate: number;
  click_rate: number;
}

export type PerformancePeriod = '7d' | '30d' | '90d' | 'all';

export interface CampaignsPerformanceOverTime {
  period: PerformancePeriod;
  data: CampaignPerformanceDataPoint[];
}

// =====================================================================
// Types pour le dashboard analytics
// =====================================================================

export interface TopCampaign {
  campaign_id: string;
  subject: string;
  template_type: CampaignTemplateType;
  open_rate: number;
  click_rate: number;
  total_sent: number;
  sent_at: string;
}

export interface TemplatePerformance {
  template_type: CampaignTemplateType;
  campaigns_count: number;
  avg_open_rate: number;
  avg_click_rate: number;
  total_sent: number;
}

export interface AnalyticsDashboardData {
  overview: CampaignsOverviewStats;
  top_campaigns: TopCampaign[];
  template_performance: TemplatePerformance[];
  performance_over_time: CampaignsPerformanceOverTime;
}

// =====================================================================
// Types pour les filtres du dashboard
// =====================================================================

export interface AnalyticsFilters {
  period: PerformancePeriod;
  template_type?: CampaignTemplateType;
  segment?: CampaignSegment;
}

// =====================================================================
// Types pour les actions serveur (retours de fonctions)
// =====================================================================

export interface GetCampaignEventsResult {
  success: boolean;
  events: EmailEventTimeline[];
  total_count: number;
  error?: string;
}

export interface GetCampaignAnalyticsResult {
  success: boolean;
  analytics: CampaignAnalytics | null;
  error?: string;
}

export interface GetABTestComparisonResult {
  success: boolean;
  comparison: ABTestComparison | null;
  error?: string;
}
