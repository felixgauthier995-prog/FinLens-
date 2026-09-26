import { supabaseAdminClient } from "@/lib/supabase/admin";
export async function reserveQuota(name: string, max: number) {
  if (!supabaseAdminClient) return false;
  const { data, error } = await supabaseAdminClient.rpc("reserve_ai_call", {
    bucket_name: name,
    max_calls: max,
  });
  return !error && data === true;
}
