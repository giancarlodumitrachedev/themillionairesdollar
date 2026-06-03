import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Lazily-instantiated Stripe client. Server-only. Throws if the secret key is
 * missing at call time (so build / static analysis never needs the key).
 */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  _stripe = new Stripe(key, {
    // Pin to the SDK's bundled API version for type compatibility.
    typescript: true,
    appInfo: { name: "The Millionaire's Dollar" },
  });
  return _stripe;
}
