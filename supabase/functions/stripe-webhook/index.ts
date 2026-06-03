// Supabase Edge Function: stripe-webhook
//
// Alternative to the Next.js route at app/api/stripe/webhook. Deploy with:
//   supabase functions deploy stripe-webhook --no-verify-jwt
// and set the Stripe webhook endpoint to:
//   https://<project-ref>.functions.supabase.co/stripe-webhook
//
// Required secrets (supabase secrets set ...):
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY
//
// deno-lint-ignore-file no-explicit-any
import Stripe from "https://esm.sh/stripe@17.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function jitter(lat: number, lng: number) {
  return {
    latitude: +(lat + (Math.random() - 0.5) * 0.09).toFixed(5),
    longitude: +(lng + (Math.random() - 0.5) * 0.09).toFixed(5),
  };
}

async function geocode(country: string, city?: string | null) {
  try {
    const params = new URLSearchParams({ format: "jsonv2", limit: "1", country });
    if (city) params.set("city", city);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { "User-Agent": "TheMillionairesDollar/1.0" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data[0]) return null;
    return jitter(parseFloat(data[0].lat), parseFloat(data[0].lon));
  } catch {
    return null;
  }
}

async function sendWelcome(to: string, tileNumber: number, tileId: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key || !to) return;
  const body =
    `Your tile is now part of the Wall.\n\nYou are number ${tileNumber}.\n\n` +
    `View it here: https://themillionairesdollar.com/tile/${tileId}\n` +
    `Share it if you wish.\n\nWe're glad you exist.\n\n— The Curators`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "The Curators <hello@themillionairesdollar.com>",
      to,
      subject: `Welcome to the Wall, #${tileNumber}`,
      text: body,
    }),
  });
}

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!sig || !secret) return new Response("Not configured", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      secret,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    return new Response(`Invalid signature: ${err}`, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return Response.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = (session.metadata ?? {}) as Record<string, string>;
  if (!meta.tier) return Response.json({ received: true });

  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id ?? null;

  if (paymentIntentId) {
    const { data: existing } = await supabase
      .from("participants")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();
    if (existing) return Response.json({ received: true, duplicate: true });
  }

  const email = session.customer_details?.email ?? session.customer_email ?? "";
  const country = (meta.country_code ?? "").toUpperCase();
  const coords = country ? await geocode(country, meta.city || null) : null;
  const year = meta.year ? parseInt(meta.year, 10) : NaN;
  const highTier = ["founding", "permanent", "patron", "curators_circle"]
    .includes(meta.tier);

  const { data: inserted, error } = await supabase
    .from("participants")
    .insert({
      tier: meta.tier,
      amount_paid_cents: session.amount_total ?? 0,
      email,
      display_name: meta.display_name ?? "Anonymous",
      display_as: meta.display_as === "full_name" ? "full_name" : "initials",
      country_code: country || "XX",
      city: meta.city || null,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      year_became_millionaire: Number.isFinite(year) ? year : null,
      personal_message: meta.personal_message || null,
      linkedin_url: meta.linkedin_url || null,
      business_email: meta.business_email || null,
      source_of_wealth: meta.source_of_wealth || null,
      phone_number: meta.phone_number || null,
      consent_future_contact: meta.consent_future_contact === "true",
      consent_newsletter: meta.consent_newsletter === "true",
      vetting_status: highTier ? "pending" : "none",
      stripe_payment_intent_id: paymentIntentId,
      stripe_customer_id: typeof session.customer === "string"
        ? session.customer
        : null,
    })
    .select("id, tile_number")
    .single();

  if (error || !inserted) {
    return new Response(`Insert failed: ${error?.message}`, { status: 500 });
  }

  if (meta.consent_newsletter === "true" && email) {
    await supabase.from("newsletter_subscribers").upsert(
      { email, source: "checkout", participant_id: inserted.id },
      { onConflict: "email" },
    );
  }

  await sendWelcome(email, inserted.tile_number, inserted.id);
  return Response.json({ received: true, tile: inserted.tile_number });
});
