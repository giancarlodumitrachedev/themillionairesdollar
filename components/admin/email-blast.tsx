"use client";

import { useState, useTransition } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendEmailBlast } from "@/app/(admin)/admin/actions";

export function EmailBlast() {
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function send() {
    if (!subject || !text) return;
    const html = `<div style="font-family:Georgia,serif;color:#f5f3ee;background:#0a0a0a;padding:32px">${text
      .split("\n")
      .map((l) => `<p style="line-height:1.7;color:#a8a59e">${l}</p>`)
      .join("")}</div>`;
    startTransition(async () => {
      const res = await sendEmailBlast({ subject, html, text });
      setResult(res.ok ? `Sent to ${res.sent} subscribers.` : "Send failed.");
    });
  }

  return (
    <div className="max-w-xl space-y-4">
      <Input
        label="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <Textarea
        label="Body (plain text → styled HTML)"
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button onClick={send} disabled={pending || !subject || !text} fullWidth>
        {pending ? "Sending…" : "Send to all consented subscribers"}
      </Button>
      {result && (
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-success)]">
          {result}
        </p>
      )}
    </div>
  );
}
