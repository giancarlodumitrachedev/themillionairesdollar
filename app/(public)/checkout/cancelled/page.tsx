import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/home/footer";

export const metadata: Metadata = {
  title: "Payment cancelled",
  robots: { index: false, follow: false },
};

export default function CancelledPage() {
  return (
    <>
      <section className="flex min-h-[80svh] flex-col items-center justify-center px-5 pt-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
          Nothing was charged
        </p>
        <h1 className="mt-6 font-display text-4xl font-light text-[var(--color-text-primary)] sm:text-5xl">
          You stepped back
        </h1>
        <p className="mt-8 max-w-md font-body text-base text-[var(--color-text-secondary)]">
          The Wall is still here whenever you decide. No payment was taken.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/participate"
            className="inline-flex items-center justify-center rounded-[2px] border border-[var(--color-text-primary)] bg-[var(--color-bg)] px-8 py-4 font-body text-sm font-medium uppercase tracking-[0.1em] text-[var(--color-text-primary)] transition-colors duration-300 hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)]"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="border-b border-[var(--color-border-strong)] pb-1 font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            Back home
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
