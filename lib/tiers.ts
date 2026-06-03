import type { Tier, TierOverrides } from "./types";

export interface TierConfig {
  id: Tier;
  /** Display name, uppercase mono in UI. */
  name: string;
  /** Price in cents (EUR). */
  amountCents: number;
  /** Human price label, e.g. "€5", "€5,000". */
  priceLabel: string;
  /** Stripe product name. */
  productName: string;
  /**
   * Cumulative revenue (in cents) that must be reached before this tier
   * becomes available. 0 = always available.
   */
  unlockRevenueCents: number;
  /** Marketing description (English). */
  description: string;
  /** Marketing description (Italian). */
  descriptionIt: string;
  /** Whether this tier requires the extended vetting form (€500+). */
  requiresVetting: boolean;
  /** Whether this tier collects a phone number for concierge (€5K+). */
  requiresPhone: boolean;
}

/**
 * Canonical tier definitions. Prices match the Stripe integration in
 * lib/stripe.ts. Order here is the display order on the Wall and Tiers grid.
 */
export const TIERS: Record<Tier, TierConfig> = {
  existence: {
    id: "existence",
    name: "Existence",
    amountCents: 500,
    priceLabel: "€5",
    productName: "Existence Tile",
    unlockRevenueCents: 0,
    description:
      "A tile on the Wall. Initials, country, year. One line of your choosing. Permanent, for as long as the project exists.",
    descriptionIt:
      "Una tessera sul Muro. Iniziali, paese, anno. Una riga a tua scelta. Permanente, per tutta la durata del progetto.",
    requiresVetting: false,
    requiresPhone: false,
  },
  verified: {
    id: "verified",
    name: "Verified",
    amountCents: 5000,
    priceLabel: "€50",
    productName: "Verified Tile",
    unlockRevenueCents: 0,
    description:
      "Existence, plus the verification mark. Brief identity check via LinkedIn or business email. Signals to the Wall that you're real.",
    descriptionIt:
      "Existence, più il segno di verifica. Breve controllo d'identità via LinkedIn o email aziendale. Segnala al Muro che sei reale.",
    requiresVetting: false,
    requiresPhone: false,
  },
  founding: {
    id: "founding",
    name: "Founding",
    amountCents: 50000,
    priceLabel: "€500",
    productName: "Founding Tile",
    unlockRevenueCents: 500000, // > €5K
    description:
      "A highlighted tile in the upper sections of the Wall. Your full name if you wish. Featured in the “Founders” gallery. Priority consideration for future phases.",
    descriptionIt:
      "Una tessera in evidenza nelle sezioni superiori del Muro. Il tuo nome completo se vuoi. Presente nella galleria “Founders”. Considerazione prioritaria per le fasi future.",
    requiresVetting: true,
    requiresPhone: false,
  },
  permanent: {
    id: "permanent",
    name: "Permanent",
    amountCents: 500000,
    priceLabel: "€5,000",
    productName: "Permanent Tile",
    unlockRevenueCents: 1500000, // > €15K
    description:
      "A fixed tile in the top 100 positions of the Wall, for the lifetime of the project. Your tile cannot be displaced. Direct line to The Curators.",
    descriptionIt:
      "Una tessera fissa tra le prime 100 posizioni del Muro, per tutta la vita del progetto. La tua tessera non può essere spostata. Linea diretta con I Curatori.",
    requiresVetting: true,
    requiresPhone: true,
  },
  patron: {
    id: "patron",
    name: "Patron",
    amountCents: 2500000,
    priceLabel: "€25,000",
    productName: "Patron Tile",
    unlockRevenueCents: 3000000, // > €30K
    description:
      "Everything in Permanent, plus: guaranteed invitation to the private gathering we're preparing. Travel and accommodation arranged. The Curators will be present.",
    descriptionIt:
      "Tutto ciò che è in Permanent, più: invito garantito all'incontro privato che stiamo preparando. Viaggio e alloggio organizzati. I Curatori saranno presenti.",
    requiresVetting: true,
    requiresPhone: true,
  },
  curators_circle: {
    id: "curators_circle",
    name: "Curators' Circle",
    amountCents: 3000000,
    priceLabel: "€30,000",
    productName: "Curators Circle Participation",
    unlockRevenueCents: 10000000, // > €100K
    description:
      "A pre-commitment to what comes after. Limited to 50 places. If, when revealed, you don't want to continue — full refund.",
    descriptionIt:
      "Un pre-impegno verso ciò che verrà dopo. Limitato a 50 posti. Se, quando sarà rivelato, non vorrai continuare — rimborso completo.",
    requiresVetting: true,
    requiresPhone: true,
  },
};

/** Ordered list of tiers (display order). */
export const TIER_ORDER: Tier[] = [
  "existence",
  "verified",
  "founding",
  "permanent",
  "patron",
  "curators_circle",
];

/** Stripe price map, kept in sync with TIERS. */
export const TIER_PRICES: Record<Tier, { amount: number; name: string }> =
  Object.fromEntries(
    TIER_ORDER.map((t) => [
      t,
      { amount: TIERS[t].amountCents, name: TIERS[t].productName },
    ])
  ) as Record<Tier, { amount: number; name: string }>;

/**
 * Given cumulative revenue in cents, return the tiers that should be visible.
 * Existence and Verified are always available. Admin overrides win:
 *   override === true  -> force the tier on regardless of revenue
 *   override === false -> force the tier off regardless of revenue
 */
export function availableTiers(
  revenueCents: number,
  overrides: TierOverrides = {}
): TierConfig[] {
  return TIER_ORDER.map((t) => TIERS[t]).filter((tier) => {
    const override = overrides[tier.id];
    if (override === true) return true;
    if (override === false) return false;
    return revenueCents >= tier.unlockRevenueCents;
  });
}

export function isValidTier(value: string): value is Tier {
  return (TIER_ORDER as string[]).includes(value);
}
