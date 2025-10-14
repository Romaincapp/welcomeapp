export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          slug: string
          email: string
          header_color: string
          footer_color: string
          background_image: string | null
          footer_contact_phone: string | null
          footer_contact_email: string | null
          footer_contact_website: string | null
          footer_contact_facebook: string | null
          footer_contact_instagram: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          email: string
          header_color?: string
          footer_color?: string
          background_image?: string | null
          footer_contact_phone?: string | null
          footer_contact_email?: string | null
          footer_contact_website?: string | null
          footer_contact_facebook?: string | null
          footer_contact_instagram?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          email?: string
          header_color?: string
          footer_color?: string
          background_image?: string | null
          footer_contact_phone?: string | null
          footer_contact_email?: string | null
          footer_contact_website?: string | null
          footer_contact_facebook?: string | null
          footer_contact_instagram?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          created_at?: string
        }
      }
      tips: {
        Row: {
          id: string
          client_id: string
          category_id: string | null
          title: string
          comment: string | null
          route_url: string | null
          location: string | null
          coordinates: Json | null
          contact_email: string | null
          contact_phone: string | null
          contact_social: Json | null
          promo_code: string | null
          opening_hours: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          category_id?: string | null
          title: string
          comment?: string | null
          route_url?: string | null
          location?: string | null
          coordinates?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_social?: Json | null
          promo_code?: string | null
          opening_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          category_id?: string | null
          title?: string
          comment?: string | null
          route_url?: string | null
          location?: string | null
          coordinates?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_social?: Json | null
          promo_code?: string | null
          opening_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      tip_media: {
        Row: {
          id: string
          tip_id: string
          url: string
          type: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          tip_id: string
          url: string
          type: string
          order?: number
          created_at?: string
        }
        Update: {
          id?: string
          tip_id?: string
          url?: string
          type?: string
          order?: number
          created_at?: string
        }
      }
      footer_buttons: {
        Row: {
          id: string
          client_id: string
          label: string
          emoji: string
          link: string
          order: number
        }
        Insert: {
          id?: string
          client_id: string
          label: string
          emoji: string
          link: string
          order?: number
        }
        Update: {
          id?: string
          client_id?: string
          label?: string
          emoji?: string
          link?: string
          order?: number
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
