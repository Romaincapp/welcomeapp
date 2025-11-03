import { Database } from './database.types'
import { Json } from './database.types'

// Types de base depuis database.types.ts
export type Client = Database['public']['Tables']['clients']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Tip = Database['public']['Tables']['tips']['Row']
export type TipMedia = Database['public']['Tables']['tip_media']['Row']
export type SecureSection = Database['public']['Tables']['secure_sections']['Row']
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']

// Types pour les Insert/Update
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type TipInsert = Database['public']['Tables']['tips']['Insert']
export type TipUpdate = Database['public']['Tables']['tips']['Update']
export type TipMediaInsert = Database['public']['Tables']['tip_media']['Insert']
export type SecureSectionInsert = Database['public']['Tables']['secure_sections']['Insert']

export interface Coordinates {
  lat: number
  lng: number
}

export interface OpeningHours {
  monday?: string
  tuesday?: string
  wednesday?: string
  thursday?: string
  friday?: string
  saturday?: string
  sunday?: string
}

export interface ContactSocial {
  facebook?: string
  instagram?: string
  twitter?: string
  website?: string
}

export interface Review {
  author_name: string
  rating: number
  text: string
  relative_time_description: string
  profile_photo_url?: string
  time?: number
}

export interface TipWithDetails extends Tip {
  category?: Category | null
  media: TipMedia[]
  coordinates_parsed?: Coordinates
  opening_hours_parsed?: OpeningHours
  contact_social_parsed?: ContactSocial
  reviews_parsed?: Review[]
}

export interface SecurePhoto {
  url: string
  caption?: string
}

export interface SecureSectionData {
  checkInTime?: string
  checkOutTime?: string
  arrivalInstructions?: string
  propertyAddress?: string
  propertyCoordinates?: Coordinates
  wifiSsid?: string
  wifiPassword?: string
  parkingInfo?: string
  additionalInfo?: string
  photos?: SecurePhoto[]
}

export interface SecureSectionWithDetails extends Omit<SecureSection, 'property_coordinates'> {
  property_coordinates_parsed?: Coordinates
}

export interface ClientWithDetails extends Client {
  tips: TipWithDetails[]
  categories: Category[]
  secure_section?: SecureSectionWithDetails | null
}

// QR Code Design types
export type QRCodeDesign = Database['public']['Tables']['qr_code_designs']['Row']
export type QRCodeDesignInsert = Database['public']['Tables']['qr_code_designs']['Insert']
export type QRCodeDesignUpdate = Database['public']['Tables']['qr_code_designs']['Update']

export type QRTheme = 'modern-minimal' | 'bold-gradient' | 'clean-professional' | 'elegant-frame'
export type QROrientation = 'portrait' | 'landscape'

export interface QRCodeDesignFormData {
  title: string
  subtitle: string
  content: string
  footerCol1: string
  footerCol2: string
  footerCol3: string
  theme: QRTheme
  orientation: QROrientation
  qrColor: string
  logoFile?: File | null
  logoUrl?: string | null
}

export interface QRThemeConfig {
  id: QRTheme
  name: string
  description: string
  previewClasses: string
  borderStyle: string
  backgroundColor: string
}
