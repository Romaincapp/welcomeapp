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
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
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
          icon?: string | null
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
          icon?: string | null
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
          footer_color: string | null
          footer_contact_email: string | null
          footer_contact_facebook: string | null
          footer_contact_instagram: string | null
          footer_contact_phone: string | null
          footer_contact_website: string | null
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
          footer_color?: string | null
          footer_contact_email?: string | null
          footer_contact_facebook?: string | null
          footer_contact_instagram?: string | null
          footer_contact_phone?: string | null
          footer_contact_website?: string | null
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
          footer_color?: string | null
          footer_contact_email?: string | null
          footer_contact_facebook?: string | null
          footer_contact_instagram?: string | null
          footer_contact_phone?: string | null
          footer_contact_website?: string | null
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
            referencedRelation: "user_welcomebook_stats"
            referencedColumns: ["client_id"]
          },
        ]
      }
    }
    Views: {
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
      generate_unique_slug: { Args: { base_name: string }; Returns: string }
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
      is_client_owner: { Args: { client_id_param: string }; Returns: boolean }
      is_tip_owner: { Args: { tip_id_param: string }; Returns: boolean }
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
