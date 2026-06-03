"use client";

import { useMemo, useState, useTransition } from "react";
import type { Participant } from "@/lib/types";
import { TIERS } from "@/lib/tiers";
import { countryName, formatEur, formatLongDate, formatTileNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { setParticipantFlags } from "@/app/(admin)/admin/actions";

function RowActions({ row }: { row: Participant }) {
  const [isPublic, setIsPublic] = useState(row.is_public);
  const [highlighted, setHighlighted] = useState(row.is_highlighted);
  const [pending, startTransition] = useTransition();

  function toggle(flags: { is_public?: boolean; is_highlighted?: boolean }) {
    if (flags.is_public !== undefined) setIsPublic(flags.is_public);
    if (flags.is_highlighted !== undefined) setHighlighted(flags.is_highlighted);
    startTransition(async () => void (await setParticipantFlags(row.id, flags)));
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={pending}
        onClick={() => toggle({ is_public: !isPublic })}
        className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] disabled:opacity-50"
      >
        {isPublic ? "Hide" : "Show"}
      </button>
      <button
        disabled={pending}
        onClick={() => toggle({ is_highlighted: !highlighted })}
        className={cn(
          "font-mono text-[9px] uppercase tracking-[0.1em] hover:text-[var(--color-accent-bright)] disabled:opacity-50",
          highlighted ? "text-[var(--color-accent-bright)]" : "text-[var(--color-text-tertiary)]"
        )}
      >
        {highlighted ? "★" : "Star"}
      </button>
    </div>
  );
}

type SortKey = "tile_number" | "created_at" | "amount_paid_cents" | "tier";

export function ParticipantsTable({ rows }: { rows: Participant[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("created_at");
  const [asc, setAsc] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = rows;
    if (term) {
      out = rows.filter(
        (r) =>
          r.display_name.toLowerCase().includes(term) ||
          r.email.toLowerCase().includes(term) ||
          r.country_code.toLowerCase().includes(term) ||
          (r.city ?? "").toLowerCase().includes(term) ||
          String(r.tile_number).includes(term)
      );
    }
    const dir = asc ? 1 : -1;
    return [...out].sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, q, sort, asc]);

  function header(key: SortKey, label: string) {
    return (
      <button
        onClick={() => {
          if (sort === key) setAsc((v) => !v);
          else {
            setSort(key);
            setAsc(false);
          }
        }}
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.1em]",
          sort === key
            ? "text-[var(--color-text-primary)]"
            : "text-[var(--color-text-tertiary)]"
        )}
      >
        {label}
        {sort === key ? (asc ? " ↑" : " ↓") : ""}
      </button>
    );
  }

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, email, country, tile…"
        className="mb-6 w-full max-w-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 font-body text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none"
      />

      <div className="overflow-x-auto border border-[var(--color-border)]">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-left">
              <th className="p-3">{header("tile_number", "Tile")}</th>
              <th className="p-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                Name
              </th>
              <th className="p-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                Email
              </th>
              <th className="p-3">{header("tier", "Tier")}</th>
              <th className="p-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                Location
              </th>
              <th className="p-3">{header("amount_paid_cents", "Paid")}</th>
              <th className="p-3">{header("created_at", "Date")}</th>
              <th className="p-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                Public
              </th>
              <th className="p-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                Manage
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="border-b border-[var(--color-border)] font-body text-sm text-[var(--color-text-secondary)]"
              >
                <td className="p-3 font-mono text-xs text-[var(--color-text-tertiary)]">
                  {formatTileNumber(r.tile_number)}
                </td>
                <td className="p-3 text-[var(--color-text-primary)]">
                  {r.display_name}
                </td>
                <td className="p-3 font-mono text-xs">{r.email}</td>
                <td className="p-3 font-mono text-xs uppercase">
                  {TIERS[r.tier].name}
                </td>
                <td className="p-3">
                  {r.city ? `${r.city}, ` : ""}
                  {countryName(r.country_code)}
                </td>
                <td className="p-3 font-mono text-xs">
                  {formatEur(r.amount_paid_cents)}
                </td>
                <td className="p-3 font-mono text-xs text-[var(--color-text-tertiary)]">
                  {formatLongDate(r.created_at)}
                </td>
                <td className="p-3 font-mono text-xs">
                  {r.is_public ? "✓" : "—"}
                </td>
                <td className="p-3">
                  <RowActions row={r} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
        {filtered.length} of {rows.length}
      </p>
    </div>
  );
}
