import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/env";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Privileged client — bypasses Row Level Security entirely. Server-only:
 * never import this from a Client Component or anything bundled for the
 * browser. Used exclusively by ingestion routes (sync jobs) that need to
 * write data the public anon key isn't allowed to write.
 */
export const supabaseAdminClient: SupabaseClient | null =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      })
    : null;
