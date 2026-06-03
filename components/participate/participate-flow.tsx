"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tile } from "@/components/wall/tile";
import { COUNTRIES } from "@/lib/countries";
import { TIERS, type TierConfig } from "@/lib/tiers";
import type { DisplayAs, ParticipantFormData, PublicTile, Tier } from "@/lib/types";
import { cn, isValidEmail } from "@/lib/utils";

type Step = "tier" | "info" | "review";

const MESSAGE_MAX = 60;
const NAME_MAX = 32;
const CURRENT_YEAR = new Date().getFullYear();

interface FormState extends ParticipantFormData {}

const EMPTY: FormState = {
  email: "",
  display_name: "",
  display_as: "initials",
  country_code: "",
  city: "",
  year_became_millionaire: null,
  personal_message: "",
  linkedin_url: "",
  business_email: "",
  source_of_wealth: "",
  phone_number: "",
  consent_participation: false,
  consent_future_contact: false,
  consent_newsletter: false,
};

function Checkbox({
  checked,
  onChange,
  children,
  required,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        required={required}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 appearance-none border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] checked:border-[var(--color-accent)] checked:bg-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent-bright)]"
      />
      <span className="font-body text-sm leading-snug text-[var(--color-text-secondary)]">
        {children}
        {required && <span className="text-[var(--color-text-tertiary)]"> *</span>}
      </span>
    </label>
  );
}

export function ParticipateFlow({
  tiers,
  initialTier,
}: {
  tiers: TierConfig[];
  initialTier?: Tier;
}) {
  const { dict, locale } = useLocale();
  const [step, setStep] = useState<Step>(initialTier ? "info" : "tier");
  const [selectedTier, setSelectedTier] = useState<Tier | null>(
    initialTier ?? null
  );
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tier = selectedTier ? TIERS[selectedTier] : null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const previewTile: PublicTile = useMemo(
    () => ({
      id: "preview",
      tile_number: 0,
      tier: selectedTier ?? "existence",
      display_name: form.display_name || "Your Name",
      display_as: form.display_as,
      country_code: form.country_code || "··",
      city: form.city || null,
      latitude: null,
      longitude: null,
      year_became_millionaire: form.year_became_millionaire ?? null,
      personal_message: form.personal_message || null,
      created_at: new Date().toISOString(),
    }),
    [form, selectedTier]
  );

  const infoValid =
    isValidEmail(form.email) &&
    form.display_name.trim().length > 0 &&
    form.country_code.length === 2 &&
    form.consent_participation;

  async function submit() {
    if (!selectedTier) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier, participantData: form }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="container-editorial pb-32 pt-32">
      {/* Progress */}
      <ol className="mb-12 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
        {(["tier", "info", "review"] as Step[]).map((s, i) => (
          <li key={s} className="flex items-center gap-4">
            <span className={cn(step === s && "text-[var(--color-text-primary)]")}>
              {String(i + 1).padStart(2, "0")} —{" "}
              {s === "tier" ? "Tier" : s === "info" ? "Details" : "Review"}
            </span>
            {i < 2 && <span aria-hidden="true">·</span>}
          </li>
        ))}
      </ol>

      {/* STEP 1 — Tier */}
      {step === "tier" && (
        <div>
          <h1 className="font-display text-4xl font-light text-[var(--color-text-primary)] sm:text-5xl">
            {dict.common.addYourself}
          </h1>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTier(t.id);
                  setStep("info");
                }}
                className="flex min-h-[280px] flex-col rounded-[2px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 text-left transition-colors duration-300 hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-overlay)]"
              >
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
                  {t.name}
                </span>
                <span className="mt-4 font-display text-5xl font-light text-[var(--color-text-primary)]">
                  {t.priceLabel}
                </span>
                <span className="mt-4 flex-1 font-body text-sm leading-[1.6] text-[var(--color-text-secondary)]">
                  {locale === "it" ? t.descriptionIt : t.description}
                </span>
                <span className="mt-6 font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-accent-bright)]">
                  {dict.tiers.cta} →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 — Info */}
      {step === "info" && tier && (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
          <div className="max-w-xl">
            <button
              onClick={() => setStep("tier")}
              className="mb-8 font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              ← Change tier ({tier.name}, {tier.priceLabel})
            </button>

            <div className="space-y-6">
              <Input
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                error={
                  form.email && !isValidEmail(form.email)
                    ? "Please enter a valid email."
                    : undefined
                }
              />

              <Input
                label="Display name"
                required
                maxLength={NAME_MAX}
                value={form.display_name}
                onChange={(e) => set("display_name", e.target.value)}
                hint={`${form.display_name.length}/${NAME_MAX}`}
              />

              <fieldset>
                <legend className="mb-2 font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                  Show as
                </legend>
                <div className="flex gap-6">
                  {(["initials", "full_name"] as DisplayAs[]).map((opt) => (
                    <label key={opt} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="display_as"
                        checked={form.display_as === opt}
                        onChange={() => set("display_as", opt)}
                        className="h-4 w-4 appearance-none rounded-full border border-[var(--color-border-strong)] checked:border-[var(--color-accent)] checked:bg-[var(--color-accent)]"
                      />
                      <span className="font-body text-sm text-[var(--color-text-secondary)]">
                        {opt === "initials" ? "Initials only" : "Full name"}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <Select
                label="Country"
                required
                value={form.country_code}
                onChange={(e) => set("country_code", e.target.value)}
              >
                <option value="">Select a country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </Select>

              <Input
                label="City (optional)"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />

              <Input
                label="Year you became a millionaire (optional)"
                type="number"
                min={1950}
                max={CURRENT_YEAR}
                value={form.year_became_millionaire ?? ""}
                onChange={(e) =>
                  set(
                    "year_became_millionaire",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              />

              <Textarea
                label="One line (optional)"
                maxLength={MESSAGE_MAX}
                value={form.personal_message}
                onChange={(e) => set("personal_message", e.target.value)}
                hint={`${(form.personal_message ?? "").length}/${MESSAGE_MAX}`}
              />

              {/* High-tier fields */}
              {tier.requiresVetting && (
                <div className="space-y-6 border-t border-[var(--color-border)] pt-6">
                  <p className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                    Verification
                  </p>
                  <Input
                    label="LinkedIn URL"
                    type="url"
                    value={form.linkedin_url}
                    onChange={(e) => set("linkedin_url", e.target.value)}
                  />
                  <Input
                    label="Business email"
                    type="email"
                    value={form.business_email}
                    onChange={(e) => set("business_email", e.target.value)}
                  />
                  <Textarea
                    label="Source of wealth"
                    maxLength={200}
                    value={form.source_of_wealth}
                    onChange={(e) => set("source_of_wealth", e.target.value)}
                  />
                </div>
              )}

              {tier.requiresPhone && (
                <Input
                  label="Phone (for concierge contact)"
                  type="tel"
                  value={form.phone_number}
                  onChange={(e) => set("phone_number", e.target.value)}
                />
              )}

              {/* Consents */}
              <div className="space-y-4 border-t border-[var(--color-border)] pt-6">
                <Checkbox
                  required
                  checked={form.consent_participation}
                  onChange={(v) => set("consent_participation", v)}
                >
                  I confirm I&apos;m 18+ and want to add myself to The Wall.
                </Checkbox>
                <Checkbox
                  checked={form.consent_future_contact}
                  onChange={(v) => set("consent_future_contact", v)}
                >
                  I consent to being contacted about future phases of the project.
                </Checkbox>
                <Checkbox
                  checked={form.consent_newsletter}
                  onChange={(v) => set("consent_newsletter", v)}
                >
                  I want to receive the weekly newsletter.
                </Checkbox>
              </div>

              <Button
                onClick={() => infoValid && setStep("review")}
                disabled={!infoValid}
                fullWidth
              >
                Review
              </Button>
            </div>
          </div>

          {/* Live preview */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
              As it will appear
            </p>
            <div className="max-w-[240px]">
              <Tile tile={previewTile} static />
            </div>
          </aside>
        </div>
      )}

      {/* STEP 3 — Review */}
      {step === "review" && tier && (
        <div className="mx-auto max-w-xl">
          <button
            onClick={() => setStep("info")}
            className="mb-8 font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            ← Edit details
          </button>

          <h1 className="font-display text-3xl font-light text-[var(--color-text-primary)]">
            Review
          </h1>

          <div className="mt-8 flex justify-center">
            <div className="w-[240px]">
              <Tile tile={previewTile} static />
            </div>
          </div>

          <dl className="mt-12 space-y-4 border-t border-[var(--color-border)] pt-8 font-body text-sm">
            {[
              ["Tier", `${tier.name} — ${tier.priceLabel}`],
              ["Email", form.email],
              ["Shown as", form.display_as === "initials" ? "Initials" : "Full name"],
              ["Country", form.country_code],
              ["City", form.city || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-[var(--color-text-tertiary)]">{k}</dt>
                <dd className="text-right text-[var(--color-text-primary)]">{v}</dd>
              </div>
            ))}
          </dl>

          {error && (
            <p className="mt-6 font-body text-sm text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}

          <div className="mt-8">
            <Button onClick={submit} disabled={submitting} fullWidth>
              {submitting ? "Processing…" : `Continue to payment · ${tier.priceLabel}`}
            </Button>
            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
              Secure payment via Stripe · {dict.tiers.permanentNote}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
