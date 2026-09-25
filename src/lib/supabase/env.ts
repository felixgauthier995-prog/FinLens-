/**
 * Public Supabase connection info (URL + anon key). Neither value is
 * secret — they're safe in the browser bundle, same as the Sanity project
 * ID/dataset. The privileged service-role key (server-only, used for
 * ingestion writes) is introduced separately in a later phase.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
