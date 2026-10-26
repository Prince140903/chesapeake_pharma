import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only service-role client for trusted administrative operations.
 * NEVER expose this or call this from client-side code.
 */
export function createAdminServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
