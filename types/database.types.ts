export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          id: string
          client_id: string
          event_type: 'view' | 'click' | 'share' | 'pwa_install'
          user_session_id: string | null
          device_type: string | null
          user_language: string | null
          user_country: string | null
          event_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          event_type: 'view' | 'click' | 'share' | 'pwa_install'
          user_session_id?: string | null
          device_type?: string | null
          user_language?: string | null
          user_country?: string | null
          event_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          event_type?: 'view' | 'click' | 'share' | 'pwa_install'
          user_session_id?: string | null
          device_type?: string | null
          user_language?: string | null
          user_country?: string | null
          event_data?: Json | null
          created_at?: string
        }
      }
      automation_history: {
        Row: {
          id: string
          user_email: string
          automation_type: string
          email_type: string
          sent_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_email: string
          automation_type: string
          email_type: string
          sent_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_email?: string
          automation_type?: string
          email_type?: string
          sent_at?: string
          metadata?: Json | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          name_en: string | null
          name_es: string | null
          name_nl: string | null
          name_de: string | null
          name_it: string | null
          name_pt: string | null
          slug: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          name_es?: string | null
          name_nl?: string | null
          name_de?: string | null
          name_it?: string | null
          name_pt?: string | null
          slug: string
          order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          name_es?: string | null
          name_nl?: string | null
          name_de?: string | null
          name_it?: string | null
          name_pt?: string | null
          slug?: string
          order?: number
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string | null
          email: string
          slug: string
          name: string
          name_en: string | null
          name_es: string | null
          name_nl: string | null
          name_de: string | null
          name_it: string | null
          name_pt: string | null
          welcomebook_name: string | null
          header_color: string
          header_subtitle: string | null
          header_subtitle_en: string | null
          header_subtitle_es: string | null
          header_subtitle_nl: string | null
          header_subtitle_de: string | null
          header_subtitle_it: string | null
          header_subtitle_pt: string | null
          footer_color: string
          footer_contact_phone: string | null
          footer_contact_email: string | null
          footer_contact_website: string | null
          footer_contact_facebook: string | null
          footer_contact_instagram: string | null
          background_image: string | null
          mobile_background_position: string | null
          background_effect: string | null
          ad_iframe_url: string | null
          subdomain: string | null
          has_shared: boolean
          email_unsubscribed: boolean
          email_unsubscribed_at: string | null
          last_activity: string
          created_at: string
          updated_at: string
          credits_balance: number
          credits_lifetime_earned: number
          account_status: 'active' | 'grace_period' | 'suspended' | 'to_delete'
          suspended_at: string | null
          last_credit_consumption: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          slug: string
          name: string
          name_en?: string | null
          name_es?: string | null
          name_nl?: string | null
          name_de?: string | null
          name_it?: string | null
          name_pt?: string | null
          welcomebook_name?: string | null
          header_color?: string
          header_subtitle?: string | null
          header_subtitle_en?: string | null
          header_subtitle_es?: string | null
          header_subtitle_nl?: string | null
          header_subtitle_de?: string | null
          header_subtitle_it?: string | null
          header_subtitle_pt?: string | null
          footer_color?: string
          footer_contact_phone?: string | null
          footer_contact_email?: string | null
          footer_contact_website?: string | null
          footer_contact_facebook?: string | null
          footer_contact_instagram?: string | null
          background_image?: string | null
          mobile_background_position?: string | null
          background_effect?: string | null
          ad_iframe_url?: string | null
          subdomain?: string | null
          has_shared?: boolean
          email_unsubscribed?: boolean
          email_unsubscribed_at?: string | null
          last_activity?: string
          created_at?: string
          updated_at?: string
          credits_balance?: number
          credits_lifetime_earned?: number
          account_status?: 'active' | 'grace_period' | 'suspended' | 'to_delete'
          suspended_at?: string | null
          last_credit_consumption?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          slug?: string
          name?: string
          name_en?: string | null
          name_es?: string | null
          name_nl?: string | null
          name_de?: string | null
          name_it?: string | null
          name_pt?: string | null
          welcomebook_name?: string | null
          header_color?: string
          header_subtitle?: string | null
          header_subtitle_en?: string | null
          header_subtitle_es?: string | null
          header_subtitle_nl?: string | null
          header_subtitle_de?: string | null
          header_subtitle_it?: string | null
          header_subtitle_pt?: string | null
          footer_color?: string
          footer_contact_phone?: string | null
          footer_contact_email?: string | null
          footer_contact_website?: string | null
          footer_contact_facebook?: string | null
          footer_contact_instagram?: string | null
          background_image?: string | null
          mobile_background_position?: string | null
          background_effect?: string | null
          ad_iframe_url?: string | null
          subdomain?: string | null
          has_shared?: boolean
          email_unsubscribed?: boolean
          email_unsubscribed_at?: string | null
          last_activity?: string
          created_at?: string
          updated_at?: string
          credits_balance?: number
          credits_lifetime_earned?: number
          account_status?: 'active' | 'grace_period' | 'suspended' | 'to_delete'
          suspended_at?: string | null
          last_credit_consumption?: string
        }
      }
      credit_requests: {
        Row: {
          id: string
          user_email: string
          client_id: string
          platform: 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'blog' | 'newsletter'
          post_type: 'post' | 'story'
          template_id: string
          personalization_score: number
          credits_requested: number
          proof_url: string | null
          proof_screenshot_url: string | null
          custom_content: string | null
          status: 'pending' | 'approved' | 'rejected' | 'auto_approved'
          reviewed_by: string | null
          review_note: string | null
          rejection_reason: string | null
          created_at: string
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          user_email: string
          client_id: string
          platform: 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'blog' | 'newsletter'
          post_type: 'post' | 'story'
          template_id: string
          personalization_score: number
          credits_requested: number
          proof_url?: string | null
          proof_screenshot_url?: string | null
          custom_content?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'auto_approved'
          reviewed_by?: string | null
          review_note?: string | null
          rejection_reason?: string | null
          created_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          user_email?: string
          client_id?: string
          platform?: 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'blog' | 'newsletter'
          post_type?: 'post' | 'story'
          template_id?: string
          personalization_score?: number
          credits_requested?: number
          proof_url?: string | null
          proof_screenshot_url?: string | null
          custom_content?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'auto_approved'
          reviewed_by?: string | null
          review_note?: string | null
          rejection_reason?: string | null
          created_at?: string
          reviewed_at?: string | null
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_email: string
          amount: number
          balance_after: number
          transaction_type: 'earn_social' | 'spend_daily' | 'manual_add' | 'manual_remove' | 'initial_bonus'
          description: string
          metadata: Json | null
          request_id: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_email: string
          amount: number
          balance_after: number
          transaction_type: 'earn_social' | 'spend_daily' | 'manual_add' | 'manual_remove' | 'initial_bonus'
          description: string
          metadata?: Json | null
          request_id?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          amount?: number
          balance_after?: number
          transaction_type?: 'earn_social' | 'spend_daily' | 'manual_add' | 'manual_remove' | 'initial_bonus'
          description?: string
          metadata?: Json | null
          request_id?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      email_automations: {
        Row: {
          id: string
          name: string
          trigger_type: string
          trigger_config: Json
          email_template: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          trigger_type: string
          trigger_config: Json
          email_template: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          trigger_type?: string
          trigger_config?: Json
          email_template?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      email_campaigns: {
        Row: {
          id: string
          name: string
          subject: string
          template_name: string
          recipients_count: number
          sent_count: number
          failed_count: number
          status: string
          ab_test_enabled: boolean
          ab_test_variant: string | null
          ab_test_subject_a: string | null
          ab_test_subject_b: string | null
          ab_test_winner: string | null
          scheduled_at: string | null
          sent_at: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          template_name: string
          recipients_count?: number
          sent_count?: number
          failed_count?: number
          status?: string
          ab_test_enabled?: boolean
          ab_test_variant?: string | null
          ab_test_subject_a?: string | null
          ab_test_subject_b?: string | null
          ab_test_winner?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          template_name?: string
          recipients_count?: number
          sent_count?: number
          failed_count?: number
          status?: string
          ab_test_enabled?: boolean
          ab_test_variant?: string | null
          ab_test_subject_a?: string | null
          ab_test_subject_b?: string | null
          ab_test_winner?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          created_by?: string
          created_at?: string
        }
      }
      email_events: {
        Row: {
          id: string
          campaign_id: string | null
          email_id: string
          recipient_email: string
          event_type: string
          event_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          email_id: string
          recipient_email: string
          event_type: string
          event_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          email_id?: string
          recipient_email?: string
          event_type?: string
          event_data?: Json | null
          created_at?: string
        }
      }
      password_reset_attempts: {
        Row: {
          id: string
          email: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      post_templates: {
        Row: {
          id: string
          title: string
          emoji: string
          category: 'testimonial' | 'comparison' | 'benefit' | 'engagement' | 'insight' | 'stats' | 'problem_solution' | 'quick_share'
          content: string
          variables: Json | null
          platform_recommendations: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          emoji: string
          category: 'testimonial' | 'comparison' | 'benefit' | 'engagement' | 'insight' | 'stats' | 'problem_solution' | 'quick_share'
          content: string
          variables?: Json | null
          platform_recommendations?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          emoji?: string
          category?: 'testimonial' | 'comparison' | 'benefit' | 'engagement' | 'insight' | 'stats' | 'problem_solution' | 'quick_share'
          content?: string
          variables?: Json | null
          platform_recommendations?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      qr_code_designs: {
        Row: {
          id: string
          client_id: string
          version: number
          is_active: boolean
          title: string
          subtitle: string
          content: string
          footer_col1: string
          footer_col2: string
          footer_col3: string
          theme: string
          orientation: string
          qr_color: string
          logo_url: string | null
          template_id: string | null
          template_config: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          version?: number
          is_active?: boolean
          title: string
          subtitle: string
          content: string
          footer_col1: string
          footer_col2: string
          footer_col3: string
          theme: string
          orientation: string
          qr_color: string
          logo_url?: string | null
          template_id?: string | null
          template_config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          version?: number
          is_active?: boolean
          title?: string
          subtitle?: string
          content?: string
          footer_col1?: string
          footer_col2?: string
          footer_col3?: string
          theme?: string
          orientation?: string
          qr_color?: string
          logo_url?: string | null
          template_id?: string | null
          template_config?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      secure_sections: {
        Row: {
          id: string
          client_id: string
          access_code_hash: string
          check_in_time: string | null
          check_out_time: string | null
          arrival_instructions: string | null
          arrival_instructions_en: string | null
          arrival_instructions_es: string | null
          arrival_instructions_nl: string | null
          arrival_instructions_de: string | null
          arrival_instructions_it: string | null
          arrival_instructions_pt: string | null
          property_address: string | null
          property_coordinates: Json | null
          wifi_ssid: string | null
          wifi_password: string | null
          parking_info: string | null
          parking_info_en: string | null
          parking_info_es: string | null
          parking_info_nl: string | null
          parking_info_de: string | null
          parking_info_it: string | null
          parking_info_pt: string | null
          additional_info: string | null
          additional_info_en: string | null
          additional_info_es: string | null
          additional_info_nl: string | null
          additional_info_de: string | null
          additional_info_it: string | null
          additional_info_pt: string | null
          photos: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          access_code_hash: string
          check_in_time?: string | null
          check_out_time?: string | null
          arrival_instructions?: string | null
          arrival_instructions_en?: string | null
          arrival_instructions_es?: string | null
          arrival_instructions_nl?: string | null
          arrival_instructions_de?: string | null
          arrival_instructions_it?: string | null
          arrival_instructions_pt?: string | null
          property_address?: string | null
          property_coordinates?: Json | null
          wifi_ssid?: string | null
          wifi_password?: string | null
          parking_info?: string | null
          parking_info_en?: string | null
          parking_info_es?: string | null
          parking_info_nl?: string | null
          parking_info_de?: string | null
          parking_info_it?: string | null
          parking_info_pt?: string | null
          additional_info?: string | null
          additional_info_en?: string | null
          additional_info_es?: string | null
          additional_info_nl?: string | null
          additional_info_de?: string | null
          additional_info_it?: string | null
          additional_info_pt?: string | null
          photos?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          access_code_hash?: string
          check_in_time?: string | null
          check_out_time?: string | null
          arrival_instructions?: string | null
          arrival_instructions_en?: string | null
          arrival_instructions_es?: string | null
          arrival_instructions_nl?: string | null
          arrival_instructions_de?: string | null
          arrival_instructions_it?: string | null
          arrival_instructions_pt?: string | null
          property_address?: string | null
          property_coordinates?: Json | null
          wifi_ssid?: string | null
          wifi_password?: string | null
          parking_info?: string | null
          parking_info_en?: string | null
          parking_info_es?: string | null
          parking_info_nl?: string | null
          parking_info_de?: string | null
          parking_info_it?: string | null
          parking_info_pt?: string | null
          additional_info?: string | null
          additional_info_en?: string | null
          additional_info_es?: string | null
          additional_info_nl?: string | null
          additional_info_de?: string | null
          additional_info_it?: string | null
          additional_info_pt?: string | null
          photos?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      tip_media: {
        Row: {
          id: string
          tip_id: string
          url: string
          thumbnail_url: string | null
          type: 'image' | 'video'
          storage_path: string | null
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          tip_id: string
          url: string
          thumbnail_url?: string | null
          type: 'image' | 'video'
          storage_path?: string | null
          order?: number
          created_at?: string
        }
        Update: {
          id?: string
          tip_id?: string
          url?: string
          thumbnail_url?: string | null
          type?: 'image' | 'video'
          storage_path?: string | null
          order?: number
          created_at?: string
        }
      }
      tips: {
        Row: {
          id: string
          client_id: string
          category_id: string | null
          title: string
          title_en: string | null
          title_es: string | null
          title_nl: string | null
          title_de: string | null
          title_it: string | null
          title_pt: string | null
          comment: string | null
          comment_en: string | null
          comment_es: string | null
          comment_nl: string | null
          comment_de: string | null
          comment_it: string | null
          comment_pt: string | null
          route_url: string | null
          location: string | null
          coordinates: Json | null
          contact_email: string | null
          contact_phone: string | null
          contact_social: Json | null
          promo_code: string | null
          opening_hours: Json | null
          rating: number | null
          user_ratings_total: number | null
          price_level: number | null
          reviews: Json | null
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          category_id?: string | null
          title: string
          title_en?: string | null
          title_es?: string | null
          title_nl?: string | null
          title_de?: string | null
          title_it?: string | null
          title_pt?: string | null
          comment?: string | null
          comment_en?: string | null
          comment_es?: string | null
          comment_nl?: string | null
          comment_de?: string | null
          comment_it?: string | null
          comment_pt?: string | null
          route_url?: string | null
          location?: string | null
          coordinates?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_social?: Json | null
          promo_code?: string | null
          opening_hours?: Json | null
          rating?: number | null
          user_ratings_total?: number | null
          price_level?: number | null
          reviews?: Json | null
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          category_id?: string | null
          title?: string
          title_en?: string | null
          title_es?: string | null
          title_nl?: string | null
          title_de?: string | null
          title_it?: string | null
          title_pt?: string | null
          comment?: string | null
          comment_en?: string | null
          comment_es?: string | null
          comment_nl?: string | null
          comment_de?: string | null
          comment_it?: string | null
          comment_pt?: string | null
          route_url?: string | null
          location?: string | null
          coordinates?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_social?: Json | null
          promo_code?: string | null
          opening_hours?: Json | null
          rating?: number | null
          user_ratings_total?: number | null
          price_level?: number | null
          reviews?: Json | null
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      trusted_users: {
        Row: {
          id: string
          user_email: string
          approved_requests_count: number
          trust_level: 'standard' | 'trusted' | 'vip'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_email: string
          approved_requests_count?: number
          trust_level?: 'standard' | 'trusted' | 'vip'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          approved_requests_count?: number
          trust_level?: 'standard' | 'trusted' | 'vip'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      unsubscribe_tokens: {
        Row: {
          id: string
          token_hash: string
          user_email: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          token_hash: string
          user_email: string
          expires_at: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          token_hash?: string
          user_email?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
