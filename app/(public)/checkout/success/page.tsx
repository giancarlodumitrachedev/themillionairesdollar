import type { Metadata } from "next";
import Link from "next/link";
import { resolveCheckout } from "@/lib/checkout-result";
import { ShareRow } from "@/components/checkout/share";
import { Footer } from "@/components/home/footer";
import { formatTileNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Welcome to the Wall",
  robots: { index: false, follow: false },
};

const SITE = process.env.NEXT_PUBLIC_URL ?? "https://themillionairesdollar.com";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const result = session_id
    ? await resolveCheckout(session_id)
    : { paid: false, email: null, tileNumber: null, tileId: null };

  const tileUrl = result.tileId ? `${SITE}/tile/${result.tileId}` : SITE;

  return (
    <>
      <section className="flex min-h-[80svh] flex-col items-center justify-center px-5 pt-24 text-center">
        {result.tileNumber ? (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
              Welcome to the Wall
            </p>
            <h1 className="mt-6 font-display text-[18vw] font-light leading-none text-[var(--color-text-primary)] sm:text-[10rem]">
              {formatTileNumber(result.tileNumber)}
            </h1>
            <p className="mt-8 max-w-md font-body text-base text-[var(--color-text-secondary)]">
              Your tile is now part of the Wall. We&apos;re glad you exist.
            </p>

            <div className="mt-10 flex flex-col items-center gap-6">
              {result.tileId && (
                <Link
                  href={`/tile/${result.tileId}`}
                  className="inline-flex items-center justify-center rounded-[2px] border border-[var(--color-text-primary)] bg-[var(--color-bg)] px-8 py-4 font-body text-sm font-medium uppercase tracking-[0.1em] text-[var(--color-text-primary)] transition-colors duration-300 hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)]"
                >
                  View your tile
                </Link>
              )}
              <ShareRow url={tileUrl} text="I added myself to The Wall." />
            </div>
          </>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
              {result.paid ? "Payment received" : "Almost there"}
            </p>
            <h1 className="mt-6 font-display text-4xl font-light text-[var(--color-text-primary)] sm:text-5xl">
              Your tile is being placed
            </h1>
            <p className="mt-8 max-w-md font-body text-base text-[var(--color-text-secondary)]">
              {result.paid
                ? "Thank you. Your tile is being created — it appears on the Wall within a moment. We've sent a confirmation to your email."
                : "If you completed payment, your tile will appear shortly. Check your email for confirmation."}
            </p>
            <Link
              href="/wall"
              className="mt-10 border-b border-[var(--color-border-strong)] pb-1 font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
            >
              Go to the Wall →
            </Link>
          </>
        )}
      </section>
      <Footer />
    </>
  );
}
