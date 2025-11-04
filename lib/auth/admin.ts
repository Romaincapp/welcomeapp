/**
 * Admin authentication helpers
 *
 * Provides utilities to check if a user is an admin/moderator.
 * Admin email is hard-coded for simplicity (no migration SQL required).
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Admin email (hard-coded)
 */
const ADMIN_EMAIL = "romainfrancedumoulin@gmail.com";

/**
 * Check if an email belongs to an admin
 */
export function isAdmin(email: string): boolean {
  return email === ADMIN_EMAIL;
}

/**
 * Check if the currently authenticated user is an admin
 * Returns the user if admin, null otherwise
 */
export async function getAdminUser() {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user || !user.email) {
    return null;
  }

  if (!isAdmin(user.email)) {
    return null;
  }

  return user;
}

/**
 * Require admin access - throws error if not admin
 * Use this in server actions to protect admin-only operations
 */
export async function requireAdmin() {
  const user = await getAdminUser();

  if (!user) {
    throw new Error("Accès refusé : vous devez être administrateur");
  }

  return user;
}

/**
 * Check if current user is admin (for UI components)
 * Returns false instead of throwing on error
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const user = await getAdminUser();
    return user !== null;
  } catch {
    return false;
  }
}
