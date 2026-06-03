"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to INSERTs on `participants` and keeps a live total. Falls back to
 * the SSR-provided initial value when Supabase isn't configured.
 *
 * Returns the current count plus a `justIncremented` flash flag the UI can use
 * for the micro-flash on the hero counter (PRD §7.5).
 */
export function useRealtimeCounter(initial: number): {
  count: number;
  justIncremented: boolean;
} {
  const [count, setCount] = useState(initial);
  const [justIncremented, setJustIncremented] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCount(initial);
  }, [initial]);

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel("participants-counter")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "counters",
          filter: "id=eq.participants_total",
        },
        (payload) => {
          const next = (payload.new as { value?: number }).value;
          if (typeof next !== "number") return;
          setCount((prev) => {
            if (next > prev) {
              setJustIncremented(true);
              if (timer.current) clearTimeout(timer.current);
              timer.current = setTimeout(() => setJustIncremented(false), 300);
            }
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
  }, []);

  return { count, justIncremented };
}
