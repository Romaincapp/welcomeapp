export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_generation_logs: {
        Row: {
          client_id: string
          created_at: string | null
          failed_count: number
          id: string
          provider_used: string | null
          success_count: number
          tips_count: number
        }
        Insert: {
          client_id: string
          created_at?: string | null
          failed_count?: number
          id?: string
          provider_used?: string | null
          success_count?: number
          tips_count?: number
        }
        Update: {
          client_id?: string
          created_at?: string | null
          failed_count?: number
          id?: string
          provider_used?: string | null
          success_count?: number
          tips_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_generation_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generation_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "eligible_for_welcome_sequence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generation_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "manager_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generation_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "top_welcomebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generation_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_welcomebook_stats"
            referencedColumns: ["client_id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          client_id: string
          created_at: string
          device_type: string | null
          event_data: Json | null
          event_type: string
          id: string
          tip_id: string | null
          user_country: string | null
          user_language: string | null
          user_session_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          tip_id?: string | null
          user_country?: string | null
          user_language?: string | null
          user_session_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          tip_id?: string | null
          user_country?: string | null
          user_language?: string | null
          user_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "eligible_for_welcome_sequence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "manager_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "top_welcomebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_welcomebook_stats"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "analytics_events_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "tips"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_history: {
        Row: {
          automation_type: string
          client_id: string
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          resend_id: string | null
          sent_at: string
          success: boolean
        }
        Insert: {
          automation_type: string
          client_id: string
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          resend_id?: string | null
          sent_at?: string
          success?: boolean
        }
        Update: {
          automation_type?: string
          client_id?: string
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          resend_id?: string | null
          sent_at?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "automation_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "eligible_for_welcome_sequence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "manager_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "top_welcomebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_welcomebook_stats"
            referencedColumns: ["client_id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          name_de: string | null
          name_en: string | null
          name_es: string | null
          name_it: string | null
          name_nl: string | null
          name_pt: string | null
          order: number | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          name_de?: string | null
          name_en?: string | null
          name_es?: string | null
          name_it?: string | null
          name_nl?: string | null
          name_pt?: string | null
          order?: number | null
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          name_de?: string | null
          name_en?: string | null
          name_es?: string | null
          name_it?: string | null
          name_nl?: string | null
          name_pt?: string | null
          order?: number | null
          slug?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          ad_iframe_url: string | null
          background_effect: string | null
          background_image: string | null
          created_at: string | null
          email: string
          email_unsubscribed: boolean
          email_unsubscribed_at: string | null
          footer_color: string | null
          footer_contact_email: string | null
          footer_contact_facebook: string | null
          footer_contact_instagram: string | null
          footer_contact_phone: string | null
          footer_contact_website: string | null
          has_shared: boolean | null
          header_color: string | null
          header_subtitle: string | null
          header_subtitle_de: string | null
          header_subtitle_en: string | null
          header_subtitle_es: string | null
          header_subtitle_it: string | null
          header_subtitle_nl: string | null
          header_subtitle_pt: string | null
          id: string
          mobile_background_position: string | null
          name: string
          name_de: string | null
          name_en: string | null
          name_es: string | null
          name_it: string | null
          name_nl: string | null
          name_pt: string | null
          slug: string
          subdomain: string | null
          user_id: string | null
        }
        Insert: {
          ad_iframe_url?: string | null
          background_effect?: string | null
          background_image?: string | null
          created_at?: string | null
          email: string
          email_unsubscribed?: boolean
          email_unsubscribed_at?: string | null
          footer_color?: string | null
          footer_contact_email?: string | null
          footer_contact_facebook?: string | null
          footer_contact_instagram?: string | null
          footer_contact_phone?: string | null
          footer_contact_website?: string | null
          has_shared?: boolean | null
          header_color?: string | null
          header_subtitle?: string | null
          header_subtitle_de?: string | null
          header_subtitle_en?: string | null
          header_subtitle_es?: string | null
          header_subtitle_it?: string | null
          header_subtitle_nl?: string | null
          header_subtitle_pt?: string | null
          id?: string
          mobile_background_position?: string | null
          name: string
          name_de?: string | null
          name_en?: string | null
          name_es?: string | null
          name_it?: string | null
          name_nl?: string | null
          name_pt?: string | null
          slug: string
          subdomain?: string | null
          user_id?: string | null
        }
        Update: {
          ad_iframe_url?: string | null
          background_effect?: string | null
          background_image?: string | null
          created_at?: string | null
          email?: string
          email_unsubscribed?: boolean
          email_unsubscribed_at?: string | null
          footer_color?: string | null
          footer_contact_email?: string | null
          footer_contact_facebook?: string | null
          footer_contact_instagram?: string | null
          footer_contact_phone?: string | null
          footer_contact_website?: string | null
          has_shared?: boolean | null
          header_color?: string | null
          header_subtitle?: string | null
          header_subtitle_de?: string | null
          header_subtitle_en?: string | null
          header_subtitle_es?: string | null
          header_subtitle_it?: string | null
          header_subtitle_nl?: string | null
          header_subtitle_pt?: string | null
          id?: string
          mobile_background_position?: string | null
          name?: string
          name_de?: string | null
          name_en?: string | null
          name_es?: string | null
          name_it?: string | null
          name_nl?: string | null
          name_pt?: string | null
          slug?: string
          subdomain?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_automations: {
        Row: {
          automation_type: string
          config: Json
          created_at: string
          id: string
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          automation_type: string
          config?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          automation_type?: string
          config?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
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
        Relationships: [
          {
            foreignKeyName: "email_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ab_test_comparison"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "email_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_analytics"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "email_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_code_designs: {
        Row: {
          client_id: string
          content: string | null
          created_at: string
          footer_col1: string | null
          footer_col2: string | null
          footer_col3: string | null
          id: string
          is_draft: boolean
          logo_url: string | null
          orientation: string
          qr_color: string
          subtitle: string | null
          theme: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          client_id: string
          content?: string | null
          created_at?: string
          footer_col1?: string | null
          footer_col2?: string | null
          footer_col3?: string | null
          id?: string
          is_draft?: boolean
          logo_url?: string | null
          orientation?: string
          qr_color?: string
          subtitle?: string | null
          theme?: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          client_id?: string
          content?: string | null
          created_at?: string
          footer_col1?: string | null
          footer_col2?: string | null
          footer_col3?: string | null
          id?: string
          is_draft?: boolean
          logo_url?: string | null
          orientation?: string
          qr_color?: string
          subtitle?: string | null
          theme?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "qr_code_designs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_code_designs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "eligible_for_welcome_sequence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_code_designs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "manager_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_code_designs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "top_welcomebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_code_designs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_welcomebook_stats"
            referencedColumns: ["client_id"]
          },
        ]
      }
      secure_sections: {
        Row: {
          access_code_hash: string
          additional_info: string | null
          additional_info_de: string | null
          additional_info_en: string | null
          additional_info_es: string | null
          additional_info_it: string | null
          additional_info_nl: string | null
          additional_info_pt: string | null
          arrival_instructions: string | null
          arrival_instructions_de: string | null
          arrival_instructions_en: string | null
          arrival_instructions_es: string | null
          arrival_instructions_it: string | null
          arrival_instructions_nl: string | null
          arrival_instructions_pt: string | null
          check_in_time: string | null
          check_out_time: string | null
          client_id: string | null
          created_at: string | null
          id: string
          parking_info: string | null
          parking_info_de: string | null
          parking_info_en: string | null
          parking_info_es: string | null
          parking_info_it: string | null
          parking_info_nl: string | null
          parking_info_pt: string | null
          photos: Json | null
          property_address: string | null
          property_coordinates: Json | null
          updated_at: string | null
          wifi_password: string | null
          wifi_ssid: string | null
        }
        Insert: {
          access_code_hash: string
          additional_info?: string | null
          additional_info_de?: string | null
          additional_info_en?: string | null
          additional_info_es?: string | null
          additional_info_it?: string | null
          additional_info_nl?: string | null
          additional_info_pt?: string | null
          arrival_instructions?: string | null
          arrival_instructions_de?: string | null
          arrival_instructions_en?: string | null
          arrival_instructions_es?: string | null
          arrival_instructions_it?: string | null
          arrival_instructions_nl?: string | null
          arrival_instructions_pt?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          parking_info?: string | null
          parking_info_de?: string | null
          parking_info_en?: string | null
          parking_info_es?: string | null
          parking_info_it?: string | null
          parking_info_nl?: string | null
          parking_info_pt?: string | null
          photos?: Json | null
          property_address?: string | null
          property_coordinates?: Json | null
          updated_at?: string | null
          wifi_password?: string | null
          wifi_ssid?: string | null
        }
        Update: {
          access_code_hash?: string
          additional_info?: string | null
          additional_info_de?: string | null
          additional_info_en?: string | null
          additional_info_es?: string | null
          additional_info_it?: string | null
          additional_info_nl?: string | null
          additional_info_pt?: string | null
          arrival_instructions?: string | null
          arrival_instructions_de?: string | null
          arrival_instructions_en?: string | null
          arrival_instructions_es?: string | null
          arrival_instructions_it?: string | null
          arrival_instructions_nl?: string | null
          arrival_instructions_pt?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          parking_info?: string | null
          parking_info_de?: string | null
          parking_info_en?: string | null
          parking_info_es?: string | null
          parking_info_it?: string | null
          parking_info_nl?: string | null
          parking_info_pt?: string | null
          photos?: Json | null
          property_address?: string | null
          property_coordinates?: Json | null
          updated_at?: string | null
          wifi_password?: string | null
          wifi_ssid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secure_sections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_sections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "eligible_for_welcome_sequence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_sections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "manager_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_sections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "top_welcomebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_sections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "user_welcomebook_stats"
            referencedColumns: ["client_id"]
          },
        ]
      }
      tip_media: {
        Row: {
          created_at: string | null
          id: string
          order: number | null
          thumbnail_url: string | null
          tip_id: string | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order?: number | null
          thumbnail_url?: string | null
          tip_id?: string | null
          type: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order?: number | null
          thumbnail_url?: string | null
          tip_id?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "tip_media_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "tips"
            referencedColumns: ["id"]
          },
        ]
      }
      tips: {
        Row: {
          category_id: string | null
          client_id: string | null
          comment: string | null
          comment_de: string | null
          comment_en: string | null
          comment_es: string | null
          comment_it: string | null
          comment_nl: string | null
          comment_pt: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_social: Json | null
          coordinates: Json | null
          created_at: string | null
          id: string
          location: string | null
          opening_hours: Json | null
          order: number | null
          price_level: number | null
          promo_code: string | null
          rating: number | null
          reviews: Json | null
          route_url: string | null
          title: string
          title_de: string | null
          title_en: string | null
          title_es: string | null
          title_it: string | null
          title_nl: string | null
          title_pt: string | null
          updated_at: string | null
          user_ratings_total: number | null
        }
        Insert: {
          category_id?: string | null
          client_id?: string | null
          comment?: string | null
          comment_de?: string | null
          comment_en?: string | null
          comment_es?: string | null
          comment_it?: string | null
          comment_nl?: string | null
          comment_pt?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_social?: Json | null
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          location?: string | null
          opening_hours?: Json | null
          order?: number | null
          price_level?: number | null
          promo_code?: string | null
          rating?: number | null
          reviews?: Json | null
          route_url?: string | null
          title: string
          title_de?: string | null
          title_en?: string | null
          title_es?: string | null
          title_it?: string | null
          title_nl?: string | null
          title_pt?: string | null
          updated_at?: string | null
          user_ratings_total?: number | null
        }
        Update: {
          category_id?: string | null
          client_id?: string | null
          comment?: string | null
          comment_de?: string | null
          comment_en?: string | null
          comment_es?: string | null
          comment_it?: string | null
          comment_nl?: string | null
          comment_pt?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_social?: Json | null
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          location?: string | null
          opening_hours?: Json | null
          order?: number | null
          price_level?: number | null
          promo_code?: string | null
          rating?: number | null
          reviews?: Json | null
          route_url?: string | null
          title?: string
          title_de?: string | null
          title_en?: string | null
          title_es?: string | null
          title_it?: string | null
          title_nl?: string | null
          title_pt?: string | null
          updated_at?: string | null
          user_ratings_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tips_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "eligible_for_welcome_sequence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "manager_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "top_welcomebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_welcomebook_stats"
            referencedColumns: ["client_id"]
          },
        ]
      }
      unsubscribe_tokens: {
        Row: {
          client_id: string
          created_at: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          expires_at?: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unsubscribe_tokens_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unsubscribe_tokens_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "eligible_for_welcome_sequence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unsubscribe_tokens_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "manager_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unsubscribe_tokens_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "top_welcomebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unsubscribe_tokens_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_welcomebook_stats"
            referencedColumns: ["client_id"]
          },
        ]
      }
    }
    Views: {
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
      automation_stats: {
        Row: {
          automation_type: string | null
          failed: number | null
          last_sent_at: string | null
          successful: number | null
          total_sent: number | null
          unique_recipients: number | null
        }
        Relationships: []
      }
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
      eligible_for_welcome_sequence: {
        Row: {
          created_at: string | null
          days_since_signup: number | null
          email: string | null
          id: string | null
          name: string | null
          next_welcome_day: number | null
          slug: string | null
        }
        Relationships: []
      }
      manager_categories: {
        Row: {
          category: string | null
          created_at: string | null
          days_since_signup: number | null
          email: string | null
          id: string | null
          slug: string | null
          total_tips: number | null
        }
        Relationships: []
      }
      platform_overview_stats: {
        Row: {
          active_clients: number | null
          average_rating: number | null
          total_clicks: number | null
          total_clients: number | null
          total_media: number | null
          total_pwa_installs: number | null
          total_qr_codes: number | null
          total_secure_sections: number | null
          total_shares: number | null
          total_tips: number | null
          total_views: number | null
        }
        Relationships: []
      }
      signups_evolution: {
        Row: {
          new_signups: number | null
          signup_date: string | null
        }
        Relationships: []
      }
      top_welcomebooks: {
        Row: {
          created_at: string | null
          email: string | null
          has_qr_code: boolean | null
          has_secure_section: boolean | null
          has_shared: boolean | null
          id: string | null
          slug: string | null
          total_clicks: number | null
          total_media: number | null
          total_tips: number | null
          total_views: number | null
          welcomebook_name: string | null
        }
        Relationships: []
      }
      unsubscribe_stats: {
        Row: {
          total_clients: number | null
          total_subscribed: number | null
          total_unsubscribed: number | null
          unsubscribe_rate: number | null
          unsubscribed_last_30_days: number | null
        }
        Relationships: []
      }
      user_welcomebook_stats: {
        Row: {
          client_id: string | null
          name: string | null
          slug: string | null
          subdomain: string | null
          total_categories: number | null
          total_media: number | null
          total_tips: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_ab_test_winner: {
        Args: { p_campaign_id: string }
        Returns: string
      }
      check_daily_quota: {
        Args: { p_client_id: string }
        Returns: {
          can_generate: boolean
          max_count: number
          used_count: number
        }[]
      }
      check_generation_cooldown: {
        Args: { p_client_id: string }
        Returns: {
          can_generate: boolean
          last_generation_at: string
          seconds_remaining: number
        }[]
      }
      cleanup_expired_unsubscribe_tokens: { Args: never; Returns: number }
      generate_unique_slug: { Args: { base_name: string }; Returns: string }
      generate_unsubscribe_token: {
        Args: { p_client_id: string }
        Returns: string
      }
      get_user_welcomebook: {
        Args: never
        Returns: {
          background_image: string
          created_at: string
          email: string
          footer_color: string
          header_color: string
          id: string
          name: string
          slug: string
          subdomain: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_client_owner: { Args: { client_id_param: string }; Returns: boolean }
      is_tip_owner: { Args: { tip_id_param: string }; Returns: boolean }
      validate_unsubscribe_token: {
        Args: { p_raw_token: string }
        Returns: {
          client_id: string
          error_message: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      color_source:
        | "99COLORS_NET"
        | "ART_PAINTS_YG07S"
        | "BYRNE"
        | "CRAYOLA"
        | "CMYK_COLOR_MODEL"
        | "COLORCODE_IS"
        | "COLORHEXA"
        | "COLORXS"
        | "CORNELL_UNIVERSITY"
        | "COLUMBIA_UNIVERSITY"
        | "DUKE_UNIVERSITY"
        | "ENCYCOLORPEDIA_COM"
        | "ETON_COLLEGE"
        | "FANTETTI_AND_PETRACCHI"
        | "FINDTHEDATA_COM"
        | "FERRARIO_1919"
        | "FEDERAL_STANDARD_595"
        | "FLAG_OF_INDIA"
        | "FLAG_OF_SOUTH_AFRICA"
        | "GLAZEBROOK_AND_BALDRY"
        | "GOOGLE"
        | "HEXCOLOR_CO"
        | "ISCC_NBS"
        | "KELLY_MOORE"
        | "MATTEL"
        | "MAERZ_AND_PAUL"
        | "MILK_PAINT"
        | "MUNSELL_COLOR_WHEEL"
        | "NATURAL_COLOR_SYSTEM"
        | "PANTONE"
        | "PLOCHERE"
        | "POURPRE_COM"
        | "RAL"
        | "RESENE"
        | "RGB_COLOR_MODEL"
        | "THOM_POOLE"
        | "UNIVERSITY_OF_ALABAMA"
        | "UNIVERSITY_OF_CALIFORNIA_DAVIS"
        | "UNIVERSITY_OF_CAMBRIDGE"
        | "UNIVERSITY_OF_NORTH_CAROLINA"
        | "UNIVERSITY_OF_TEXAS_AT_AUSTIN"
        | "X11_WEB"
        | "XONA_COM"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      color_source: [
        "99COLORS_NET",
        "ART_PAINTS_YG07S",
        "BYRNE",
        "CRAYOLA",
        "CMYK_COLOR_MODEL",
        "COLORCODE_IS",
        "COLORHEXA",
        "COLORXS",
        "CORNELL_UNIVERSITY",
        "COLUMBIA_UNIVERSITY",
        "DUKE_UNIVERSITY",
        "ENCYCOLORPEDIA_COM",
        "ETON_COLLEGE",
        "FANTETTI_AND_PETRACCHI",
        "FINDTHEDATA_COM",
        "FERRARIO_1919",
        "FEDERAL_STANDARD_595",
        "FLAG_OF_INDIA",
        "FLAG_OF_SOUTH_AFRICA",
        "GLAZEBROOK_AND_BALDRY",
        "GOOGLE",
        "HEXCOLOR_CO",
        "ISCC_NBS",
        "KELLY_MOORE",
        "MATTEL",
        "MAERZ_AND_PAUL",
        "MILK_PAINT",
        "MUNSELL_COLOR_WHEEL",
        "NATURAL_COLOR_SYSTEM",
        "PANTONE",
        "PLOCHERE",
        "POURPRE_COM",
        "RAL",
        "RESENE",
        "RGB_COLOR_MODEL",
        "THOM_POOLE",
        "UNIVERSITY_OF_ALABAMA",
        "UNIVERSITY_OF_CALIFORNIA_DAVIS",
        "UNIVERSITY_OF_CAMBRIDGE",
        "UNIVERSITY_OF_NORTH_CAROLINA",
        "UNIVERSITY_OF_TEXAS_AT_AUSTIN",
        "X11_WEB",
        "XONA_COM",
      ],
      pricing_plan_interval: ["day", "week", "month", "year"],
      pricing_type: ["one_time", "recurring"],
      subscription_status: [
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
      ],
    },
  },
} as const
