'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { PostTemplate } from '@/types'

/**
 * Récupère tous les templates de posts actifs
 */
export async function getAllTemplates(): Promise<PostTemplate[]> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: templates, error } = await (supabase
      .from('post_templates') as any)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[GET ALL TEMPLATES] Error:', error)
      return []
    }

    // Parse JSONB fields
    return (templates || []).map((t: any) => ({
      ...t,
      variables: Array.isArray(t.variables) ? t.variables : JSON.parse(t.variables || '[]'),
      platform_recommendations: Array.isArray(t.platform_recommendations)
        ? t.platform_recommendations
        : JSON.parse(t.platform_recommendations || '[]')
    }))
  } catch (error) {
    console.error('[GET ALL TEMPLATES] Error:', error)
    return []
  }
}

/**
 * Récupère un template par ID
 */
export async function getTemplateById(templateId: string): Promise<PostTemplate | null> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: template, error } = await (supabase
      .from('post_templates') as any)
      .select('*')
      .eq('id', templateId)
      .maybeSingle()

    if (error || !template) {
      console.error('[GET TEMPLATE BY ID] Error:', error)
      return null
    }

    // Parse JSONB fields
    return {
      ...template,
      variables: Array.isArray(template.variables)
        ? template.variables
        : JSON.parse(template.variables || '[]'),
      platform_recommendations: Array.isArray(template.platform_recommendations)
        ? template.platform_recommendations
        : JSON.parse(template.platform_recommendations || '[]')
    } as PostTemplate
  } catch (error) {
    console.error('[GET TEMPLATE BY ID] Error:', error)
    return null
  }
}
