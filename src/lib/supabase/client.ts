import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "@/lib/supabase/env";

/** Browser-safe client (anon key, respects Row Level Security). Sessions are
 * stored in cookies so the server can see who is signed in. */
export const supabaseBrowserClient: SupabaseClient | null =
  isSupabaseConfigured && typeof window !== "undefined"
    ? createBrowserClient(supabaseUrl!, supabaseAnonKey!)
    : null;
