import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { geocodeCity } from "@/lib/geocode";
import { sendWelcomeEmail } from "@/lib/resend";
import { isValidTier } from "@/lib/tiers";

export const runtime = "nodejs";

/**
 * Stripe webhook. On checkout.session.completed it:
 *   1. verifies the signature,
 *   2. geocodes the declared city (with privacy jitter),
 *   3. inserts the participant via the service-role client (bypasses RLS),
 *   4. records newsletter consent,
 *   5. sends the plain-text welcome email.
 */
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata ?? {};
  const tier = meta.tier;

  if (!tier || !isValidTier(tier)) {
    console.error("Webhook: invalid/missing tier in metadata");
    return NextResponse.json({ received: true });
  }

  const email = session.customer_details?.email ?? session.customer_email ?? "";
  const supabase = createAdminClient();

  // Idempotency: skip if we've already recorded this payment intent.
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  if (paymentIntentId) {
    const { data: existing } = await supabase
      .from("participants")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ received: true, duplicate: true });
    }
  }

  const country = (meta.country_code ?? "").toUpperCase();
  const city = meta.city || null;
  const coords = country ? await geocodeCity(country, city) : null;

  const yearParsed = meta.year ? parseInt(meta.year, 10) : NaN;

  const { data: inserted, error } = await supabase
    .from("participants")
    .insert({
      tier,
      amount_paid_cents: session.amount_total ?? 0,
      email,
      display_name: meta.display_name ?? "Anonymous",
      display_as: meta.display_as === "full_name" ? "full_name" : "initials",
      country_code: country || "XX",
      city,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      year_became_millionaire: Number.isFinite(yearParsed) ? yearParsed : null,
      personal_message: meta.personal_message || null,
      linkedin_url: meta.linkedin_url || null,
      business_email: meta.business_email || null,
      source_of_wealth: meta.source_of_wealth || null,
      phone_number: meta.phone_number || null,
      consent_future_contact: meta.consent_future_contact === "true",
      consent_newsletter: meta.consent_newsletter === "true",
      vetting_status:
        tier === "founding" ||
        tier === "permanent" ||
        tier === "patron" ||
        tier === "curators_circle"
          ? "pending"
          : "none",
      stripe_payment_intent_id: paymentIntentId,
      stripe_customer_id:
        typeof session.customer === "string" ? session.customer : null,
    })
    .select("id, tile_number")
    .single();

  if (error || !inserted) {
    console.error("Webhook: failed to insert participant:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  // Newsletter opt-in.
  if (meta.consent_newsletter === "true" && email) {
    await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email, source: "checkout", participant_id: inserted.id },
        { onConflict: "email" }
      );
  }

  // Welcome email (best-effort).
  if (email) {
    try {
      await sendWelcomeEmail(email, {
        tileNumber: inserted.tile_number as number,
        tileId: inserted.id as string,
      });
    } catch (e) {
      console.error("Welcome email failed:", e);
    }
  }

  return NextResponse.json({ received: true, tile: inserted.tile_number });
}
