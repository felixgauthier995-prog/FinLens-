import { redirect } from "next/navigation";
import { requireSignedIn } from "@/lib/account";
import { getStripe, syncSubscription } from "@/lib/billing/stripe";

/**
 * Stripe sends people here after paying. The webhook may not have arrived
 * yet, so we sync the subscription directly — but only after checking the
 * checkout belongs to the signed-in user.
 */
export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const account = await requireSignedIn();
  const { session_id: sessionId } = await searchParams;
  const stripe = getStripe();

  if (stripe && sessionId && !account.hasAccess) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"],
      });
      if (
        session.client_reference_id === account.user.id &&
        session.subscription &&
        typeof session.subscription !== "string"
      ) {
        await syncSubscription(session.subscription);
      }
    } catch (err) {
      console.error("[subscribe/success]", err instanceof Error ? err.message.slice(0, 200) : err);
    }
  }
  redirect("/");
}
