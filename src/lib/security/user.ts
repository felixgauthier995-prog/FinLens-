import { supabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { hasPaidAccess } from "@/lib/billing/access";

export async function requestUser(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (.+)$/)?.[1];
  if (!token || !supabaseServerClient) return null;
  const { data, error } = await supabaseServerClient.auth.getUser(token);
  return error ? null : data.user;
}

/** Signed-in user with an active subscription or trial, else null. */
export async function requestPaidUser(request: Request) {
  const user = await requestUser(request);
  if (!user || !supabaseAdminClient) return null;
  const { data } = await supabaseAdminClient
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();
  const access = hasPaidAccess(
    data
      ? {
          status: data.status,
          currentPeriodEnd: data.current_period_end,
          planInterval: null,
          trialEnd: null,
          cancelAtPeriodEnd: false,
          trialUsed: false,
        }
      : null
  );
  return access ? user : null;
}
