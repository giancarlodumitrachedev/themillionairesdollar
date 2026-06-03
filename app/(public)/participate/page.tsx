import type { Metadata } from "next";
import { ParticipateFlow } from "@/components/participate/participate-flow";
import { Footer } from "@/components/home/footer";
import { availableTiers, isValidTier } from "@/lib/tiers";
import { getTierOverrides, getTotalRevenueCents } from "@/lib/data";
import type { Tier } from "@/lib/types";

export const metadata: Metadata = {
  title: "Add yourself",
  description: "Choose how you want to exist. Every participation is permanent.",
};

export default async function ParticipatePage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier } = await searchParams;
  const [revenue, overrides] = await Promise.all([
    getTotalRevenueCents(),
    getTierOverrides(),
  ]);
  const tiers = availableTiers(revenue, overrides);

  const initialTier: Tier | undefined =
    tier && isValidTier(tier) && tiers.some((t) => t.id === tier)
      ? tier
      : undefined;

  return (
    <>
      <ParticipateFlow tiers={tiers} initialTier={initialTier} />
      <Footer />
    </>
  );
}
