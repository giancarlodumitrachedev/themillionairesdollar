"use client";

import { useState } from "react";

export function ShareRow({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(url)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url
  )}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  const cls =
    "border-b border-[var(--color-border-strong)] pb-1 font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]";

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <a href={twitter} target="_blank" rel="noopener noreferrer" className={cls}>
        Share on X
      </a>
      <a href={linkedin} target="_blank" rel="noopener noreferrer" className={cls}>
        LinkedIn
      </a>
      <button onClick={copy} className={cls}>
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
