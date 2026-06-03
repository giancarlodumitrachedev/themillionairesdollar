import type { Metadata } from "next";
import { Footer } from "@/components/home/footer";
import { Press } from "@/components/home/press";
import { getPressCoverage } from "@/lib/data";

export const metadata: Metadata = {
  title: "Press",
  description: "Press coverage of The Millionaire's Dollar.",
};

export const revalidate = 300;

export default async function PressPage() {
  const coverage = await getPressCoverage();

  return (
    <>
      <div className="pt-16">
        {coverage.length > 0 ? (
          <Press coverage={coverage} />
        ) : (
          <section className="flex min-h-[60svh] flex-col items-center justify-center px-5 text-center">
            <p className="eyebrow">05 — Coverage</p>
            <h1 className="mt-6 font-display text-4xl font-light text-[var(--color-text-primary)] sm:text-5xl">
              Not yet written
            </h1>
            <p className="mt-6 max-w-md font-body text-base text-[var(--color-text-secondary)]">
              When the wall is written about, it will be recorded here. For now,
              the wall speaks for itself.
            </p>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
