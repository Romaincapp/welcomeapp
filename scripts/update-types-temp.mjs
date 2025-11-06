import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const types = `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      // Tables existantes + email_events
      email_events: {
        Row: {
          campaign_id: string
          created_at: string
          email_id: string
          event_data: Json | null
          event_type: string
          id: string
          recipient_email: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          email_id: string
          event_data?: Json | null
          event_type: string
          id?: string
          recipient_email: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          email_id?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          recipient_email?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          ab_test_enabled: boolean
          ab_test_subject_a: string | null
          ab_test_subject_b: string | null
          ab_test_variant: string | null
          ab_test_winner: string | null
          created_at: string | null
          id: string
          results: Json | null
          segment: string
          sent_at: string | null
          sent_by: string | null
          subject: string
          template_type: string
          total_clicks: number | null
          total_failed: number | null
          total_opens: number | null
          total_recipients: number | null
          total_sent: number | null
          tracking_data: Json | null
        }
        Insert: {
          ab_test_enabled?: boolean
          ab_test_subject_a?: string | null
          ab_test_subject_b?: string | null
          ab_test_variant?: string | null
          ab_test_winner?: string | null
          created_at?: string | null
          id?: string
          results?: Json | null
          segment: string
          sent_at?: string | null
          sent_by?: string | null
          subject: string
          template_type: string
          total_clicks?: number | null
          total_failed?: number | null
          total_opens?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          tracking_data?: Json | null
        }
        Update: {
          ab_test_enabled?: boolean
          ab_test_subject_a?: string | null
          ab_test_subject_b?: string | null
          ab_test_variant?: string | null
          ab_test_winner?: string | null
          created_at?: string | null
          id?: string
          results?: Json | null
          segment?: string
          sent_at?: string | null
          sent_by?: string | null
          subject?: string
          template_type?: string
          total_clicks?: number | null
          total_failed?: number | null
          total_opens?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          tracking_data?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      campaign_analytics: {
        Row: {
          ab_test_enabled: boolean | null
          ab_test_variant: string | null
          ab_test_winner: string | null
          campaign_id: string | null
          click_rate: number | null
          delivery_rate: number | null
          open_rate: number | null
          segment: string | null
          sent_at: string | null
          subject: string | null
          template_type: string | null
          total_bounced: number | null
          total_clicked: number | null
          total_complained: number | null
          total_delivered: number | null
          total_failed: number | null
          total_opened: number | null
          total_recipients: number | null
          total_sent: number | null
        }
        Relationships: []
      }
      ab_test_comparison: {
        Row: {
          ab_test_subject_a: string | null
          ab_test_subject_b: string | null
          ab_test_winner: string | null
          base_subject: string | null
          campaign_id: string | null
          sent_at: string | null
          variant_a_clicked: number | null
          variant_a_open_rate: number | null
          variant_a_opened: number | null
          variant_a_sent: number | null
          variant_b_clicked: number | null
          variant_b_open_rate: number | null
          variant_b_opened: number | null
          variant_b_sent: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_ab_test_winner: {
        Args: { p_campaign_id: string }
        Returns: string
      }
    }
  }
}

// Type helpers...
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
`;

// Note: Ce fichier est incomplet pour rester court - il faut utiliser les types complets générés par MCP
console.log('⚠️  NOTE: Fichier simplifié créé - utiliser MCP pour types complets');

// On ne l'écrit pas réellement pour éviter de casser quelque chose
// writeFileSync(join(__dirname, '..', 'types', 'database.types.ts'), types);
console.log('✅ Script prêt (désactivé pour sécurité)');
