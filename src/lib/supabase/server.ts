import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Server-side client for Server Components / Route Handlers, using the
 * anon key — still subject to Row Level Security, same read access as the
 * browser client. Ingestion routes that need to bypass RLS for writes use
 * a separate, privileged client (introduced when the sync jobs are built).
 */
export const supabaseServerClient: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: false },
    })
  : null;
