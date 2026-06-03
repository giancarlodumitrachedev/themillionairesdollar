"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isValidEmail } from "@/lib/utils";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setState("error");
      return;
    }
    setState("loading");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        },
      });
      setState(error ? "error" : "sent");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <p className="font-display text-3xl text-[var(--color-text-primary)]">
          M.D.
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
          Curators only
        </p>

        {state === "sent" ? (
          <p className="mt-12 font-body text-sm text-[var(--color-text-secondary)]">
            Check your inbox for a sign-in link.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-12 space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state === "error") setState("idle");
              }}
              error={state === "error" ? "Enter an authorized email." : undefined}
            />
            <Button type="submit" fullWidth disabled={state === "loading"}>
              {state === "loading" ? "Sending…" : "Send magic link"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
