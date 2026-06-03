"use client";

import { useState, useTransition } from "react";
import type { Participant, VettingStatus } from "@/lib/types";
import { TIERS } from "@/lib/tiers";
import { countryName, formatEur, formatTileNumber } from "@/lib/utils";
import { updateVetting } from "@/app/(admin)/admin/vetting/actions";

function Row({ p }: { p: Participant }) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<VettingStatus>(p.vetting_status);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save(next: VettingStatus) {
    setStatus(next);
    startTransition(async () => {
      const res = await updateVetting(p.id, next, note);
      if (res.ok) {
        setSaved(true);
        setNote("");
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-[var(--color-text-tertiary)]">
            {formatTileNumber(p.tile_number)} · {TIERS[p.tier].name} ·{" "}
            {formatEur(p.amount_paid_cents)}
          </p>
          <p className="mt-2 font-display text-2xl font-light text-[var(--color-text-primary)]">
            {p.display_name}
          </p>
          <p className="mt-1 font-body text-sm text-[var(--color-text-secondary)]">
            {p.email} · {countryName(p.country_code)}
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-accent-bright)]">
          {status}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-2 font-body text-sm text-[var(--color-text-secondary)] sm:grid-cols-2">
        {p.linkedin_url && (
          <div>
            <dt className="inline text-[var(--color-text-tertiary)]">LinkedIn: </dt>
            <dd className="inline break-all">{p.linkedin_url}</dd>
          </div>
        )}
        {p.business_email && (
          <div>
            <dt className="inline text-[var(--color-text-tertiary)]">Business: </dt>
            <dd className="inline">{p.business_email}</dd>
          </div>
        )}
        {p.source_of_wealth && (
          <div className="sm:col-span-2">
            <dt className="inline text-[var(--color-text-tertiary)]">Source: </dt>
            <dd className="inline">{p.source_of_wealth}</dd>
          </div>
        )}
        {p.phone_number && (
          <div>
            <dt className="inline text-[var(--color-text-tertiary)]">Phone: </dt>
            <dd className="inline">{p.phone_number}</dd>
          </div>
        )}
      </dl>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a vetting note…"
        rows={2}
        className="mt-4 w-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 font-body text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(["in_progress", "approved", "rejected"] as VettingStatus[]).map((s) => (
          <button
            key={s}
            disabled={pending}
            onClick={() => save(s)}
            className="rounded-[2px] border border-[var(--color-border-strong)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
          >
            {s.replace("_", " ")}
          </button>
        ))}
        {saved && (
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-success)]">
            Saved
          </span>
        )}
      </div>
    </div>
  );
}

export function VettingQueue({ rows }: { rows: Participant[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-12 font-body text-sm text-[var(--color-text-tertiary)]">
        The queue is empty. No higher-tier participants awaiting vetting.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {rows.map((p) => (
        <Row key={p.id} p={p} />
      ))}
    </div>
  );
}
