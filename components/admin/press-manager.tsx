"use client";

import { useState, useTransition } from "react";
import type { PressCoverage } from "@/lib/types";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertPress, deletePress } from "@/app/(admin)/admin/actions";

export function PressManager({ initial }: { initial: PressCoverage[] }) {
  const [rows] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    publication_name: "",
    article_url: "",
    article_title: "",
    quote: "",
    publication_logo_url: "",
    is_featured: false,
  });

  function submit() {
    startTransition(async () => {
      await upsertPress(form);
      setForm({
        publication_name: "",
        article_url: "",
        article_title: "",
        quote: "",
        publication_logo_url: "",
        is_featured: false,
      });
    });
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <div className="space-y-4">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          Add coverage
        </h2>
        <Input
          label="Publication name"
          value={form.publication_name}
          onChange={(e) => setForm({ ...form, publication_name: e.target.value })}
        />
        <Input
          label="Article title"
          value={form.article_title}
          onChange={(e) => setForm({ ...form, article_title: e.target.value })}
        />
        <Input
          label="Article URL"
          type="url"
          value={form.article_url}
          onChange={(e) => setForm({ ...form, article_url: e.target.value })}
        />
        <Input
          label="Logo URL (optional)"
          type="url"
          value={form.publication_logo_url}
          onChange={(e) =>
            setForm({ ...form, publication_logo_url: e.target.value })
          }
        />
        <Textarea
          label="Pull quote (optional)"
          value={form.quote}
          onChange={(e) => setForm({ ...form, quote: e.target.value })}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
            className="h-4 w-4 appearance-none border border-[var(--color-border-strong)] checked:bg-[var(--color-accent)]"
          />
          <span className="font-body text-sm text-[var(--color-text-secondary)]">
            Feature the quote
          </span>
        </label>
        <Button
          onClick={submit}
          disabled={pending || !form.publication_name || !form.article_url}
          fullWidth
        >
          {pending ? "Saving…" : "Add"}
        </Button>
      </div>

      <div>
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          Current ({rows.length})
        </h2>
        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex items-start justify-between gap-4 border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4"
            >
              <div>
                <p className="font-display text-lg text-[var(--color-text-primary)]">
                  {r.publication_name}
                </p>
                <p className="font-body text-sm text-[var(--color-text-secondary)]">
                  {r.article_title}
                </p>
              </div>
              <DeleteButton id={r.id} />
            </div>
          ))}
          {rows.length === 0 && (
            <p className="font-body text-sm text-[var(--color-text-tertiary)]">
              No coverage yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => void (await deletePress(id)))}
      className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-danger)] hover:opacity-80"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
