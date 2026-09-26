import { supabaseServerClient } from "@/lib/supabase/server";
export async function requestUser(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (.+)$/)?.[1];
  if (!token || !supabaseServerClient) return null;
  const { data, error } = await supabaseServerClient.auth.getUser(token);
  return error ? null : data.user;
}
