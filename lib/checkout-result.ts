import "server-only";
import { getStripe } from "./stripe";
import { createAdminClient } from "./supabase/admin";

export interface CheckoutResult {
  paid: boolean;
  email: string | null;
  tileNumber: number | null;
  tileId: string | null;
}

/**
 * Resolve a Checkout Session into a tile. The webhook creates the participant
 * asynchronously, so the tile may not exist on the very first page load — the
 * success page polls/falls back gracefully.
 */
export async function resolveCheckout(
  sessionId: string
): Promise<CheckoutResult> {
  const empty: CheckoutResult = {
    paid: false,
    email: null,
    tileNumber: null,
    tileId: null,
  };

  if (!process.env.STRIPE_SECRET_KEY) return empty;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";
    const email =
      session.customer_details?.email ?? session.customer_email ?? null;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    if (
      !paymentIntentId ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return { paid, email, tileNumber: null, tileId: null };
    }

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("participants")
      .select("id, tile_number")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();

    return {
      paid,
      email,
      tileNumber: (data?.tile_number as number | undefined) ?? null,
      tileId: (data?.id as string | undefined) ?? null,
    };
  } catch {
    return empty;
  }
}
