/**
 * Domain types for The Millionaire's Dollar.
 * Mirrors the Supabase schema in supabase/migrations/001_initial_schema.sql.
 */

export type Tier =
  | "existence"
  | "verified"
  | "founding"
  | "permanent"
  | "patron"
  | "curators_circle";

export type DisplayAs = "initials" | "full_name";

export type VettingStatus =
  | "none"
  | "pending"
  | "in_progress"
  | "approved"
  | "rejected";

export type NewsletterSource = "footer" | "checkout" | "manual";

/** A row in the `participants` table. */
export interface Participant {
  id: string;
  created_at: string;
  tile_number: number;
  tier: Tier;
  amount_paid_cents: number;
  email: string;
  display_name: string;
  display_as: DisplayAs;
  country_code: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  year_became_millionaire: number | null;
  personal_message: string | null;
  linkedin_url: string | null;
  business_email: string | null;
  source_of_wealth: string | null;
  phone_number: string | null;
  consent_participation: boolean;
  consent_future_contact: boolean;
  consent_newsletter: boolean;
  is_public: boolean;
  removal_requested_at: string | null;
  vetting_status: VettingStatus;
  vetting_notes: Record<string, unknown>;
  stripe_payment_intent_id: string | null;
  stripe_customer_id: string | null;
  is_seed_participant: boolean;
  is_highlighted: boolean;
}

/**
 * The public-safe projection of a participant. This is the ONLY shape that may
 * be sent to the client / rendered on the Wall and Map. No email, no phone,
 * no business data.
 */
export interface PublicTile {
  id: string;
  tile_number: number;
  tier: Tier;
  display_name: string;
  display_as: DisplayAs;
  country_code: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  year_became_millionaire: number | null;
  personal_message: string | null;
  is_highlighted?: boolean;
  created_at: string;
}

/** Per-tier manual enable/disable overrides. true = force on, false = force off. */
export type TierOverrides = Partial<Record<Tier, boolean>>;

export interface PressCoverage {
  id: string;
  publication_name: string;
  publication_logo_url: string | null;
  article_url: string;
  article_title: string;
  quote: string | null;
  published_at: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export interface PublicStats {
  total_participants: number;
  last_24h: number;
  last_week: number;
  countries: number;
  by_country: Record<string, number>;
}

/** Data collected from the participate form, passed to Stripe metadata. */
export interface ParticipantFormData {
  email: string;
  display_name: string;
  display_as: DisplayAs;
  country_code: string;
  city?: string;
  year_became_millionaire?: number | null;
  personal_message?: string;
  linkedin_url?: string;
  business_email?: string;
  source_of_wealth?: string;
  phone_number?: string;
  consent_participation: boolean;
  consent_future_contact: boolean;
  consent_newsletter: boolean;
}
