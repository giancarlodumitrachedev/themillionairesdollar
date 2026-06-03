import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { TIERS, availableTiers, isValidTier } from "@/lib/tiers";
import { getTierOverrides, getTotalRevenueCents } from "@/lib/data";
import type { ParticipantFormData } from "@/lib/types";
import { isValidEmail } from "@/lib/utils";

export const runtime = "nodejs";

const SITE = process.env.NEXT_PUBLIC_URL ?? "https://themillionairesdollar.com";

/** Stripe metadata values must be strings and <= 500 chars. */
function toMetadata(
  tier: string,
  d: ParticipantFormData
): Record<string, string> {
  const meta: Record<string, string> = {
    tier,
    display_name: d.display_name.slice(0, 120),
    display_as: d.display_as,
    country_code: d.country_code.slice(0, 2),
    city: (d.city ?? "").slice(0, 120),
    year: d.year_became_millionaire ? String(d.year_became_millionaire) : "",
    personal_message: (d.personal_message ?? "").slice(0, 60),
    consent_future_contact: String(Boolean(d.consent_future_contact)),
    consent_newsletter: String(Boolean(d.consent_newsletter)),
  };
  // High-tier extras (only when present).
  if (d.linkedin_url) meta.linkedin_url = d.linkedin_url.slice(0, 200);
  if (d.business_email) meta.business_email = d.business_email.slice(0, 200);
  if (d.source_of_wealth)
    meta.source_of_wealth = d.source_of_wealth.slice(0, 200);
  if (d.phone_number) meta.phone_number = d.phone_number.slice(0, 40);
  return meta;
}

export async function POST(req: Request) {
  let body: { tier?: string; participantData?: ParticipantFormData };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { tier, participantData } = body;

  if (!tier || !isValidTier(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }
  if (!participantData) {
    return NextResponse.json({ error: "Missing participant data" }, { status: 400 });
  }
  if (!isValidEmail(participantData.email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!participantData.display_name?.trim()) {
    return NextResponse.json({ error: "Missing display name" }, { status: 400 });
  }
  if (!participantData.country_code) {
    return NextResponse.json({ error: "Missing country" }, { status: 400 });
  }
  if (!participantData.consent_participation) {
    return NextResponse.json(
      { error: "Participation consent is required" },
      { status: 400 }
    );
  }

  // Enforce tier availability server-side (revenue gating + admin overrides).
  const [revenue, overrides] = await Promise.all([
    getTotalRevenueCents(),
    getTierOverrides(),
  ]);
  if (!availableTiers(revenue, overrides).some((t) => t.id === tier)) {
    return NextResponse.json(
      { error: "This tier is not currently available" },
      { status: 400 }
    );
  }

  const tierConfig = TIERS[tier];

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: tierConfig.productName,
              description: "A tile on The Millionaire's Dollar Wall",
            },
            unit_amount: tierConfig.amountCents,
          },
          quantity: 1,
        },
      ],
      customer_email: participantData.email,
      success_url: `${SITE}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE}/checkout/cancelled`,
      metadata: toMetadata(tier, participantData),
      // Surface the same metadata on the PaymentIntent for the webhook.
      payment_intent_data: {
        metadata: toMetadata(tier, participantData),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
