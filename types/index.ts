import { Database } from './database.types'

export type Client = Database['public']['Tables']['clients']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Tip = Database['public']['Tables']['tips']['Row']
export type TipMedia = Database['public']['Tables']['tip_media']['Row']
export type FooterButton = Database['public']['Tables']['footer_buttons']['Row']
export type SecureSection = Database['public']['Tables']['secure_sections']['Row']

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

export interface TipWithDetails extends Tip {
  category?: Category | null
  media: TipMedia[]
  coordinates_parsed?: Coordinates
  opening_hours_parsed?: OpeningHours
  contact_social_parsed?: ContactSocial
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
}

export interface SecureSectionWithDetails extends Omit<SecureSection, 'property_coordinates'> {
  property_coordinates_parsed?: Coordinates
}

export interface ClientWithDetails extends Client {
  footer_buttons: FooterButton[]
  tips: TipWithDetails[]
  categories: Category[]
  secure_section?: SecureSectionWithDetails | null
}
