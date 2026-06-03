import type { Metadata } from "next";
import { Footer } from "@/components/home/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing participation in The Millionaire's Dollar.",
};

const SECTIONS: Array<{ h: string; p: string[] }> = [
  {
    h: "1. The service",
    p: [
      "The Millionaire's Dollar lets you place a permanent tile on a public wall and a point on a public map. It is a cultural project, not a financial product, charity, or investment.",
    ],
  },
  {
    h: "2. Nature of payment",
    p: [
      "Your payment places a tile. It is not a donation, an investment, a security, or a purchase of goods. It confers no equity, no financial return, and no expectation of profit. Any benefits described for higher tiers are non-financial.",
    ],
  },
  {
    h: "3. Eligibility",
    p: [
      "You must be at least 18 years old and legally able to enter this agreement. The invitation is addressed to millionaires, but participation runs on an honour system and is open to anyone who wishes to declare they exist.",
    ],
  },
  {
    h: "4. Your content",
    p: [
      "You are responsible for the accuracy and lawfulness of what you submit. Do not submit content that is unlawful, infringing, defamatory, or impersonates another person. We may remove tiles that violate these terms.",
    ],
  },
  {
    h: "5. Permanence and removal",
    p: [
      "Tiles are intended to be permanent for the lifetime of the project. You may request removal of your tile at any time; we will take it down. Contributions are not refunded, except where a specific tier explicitly provides otherwise.",
    ],
  },
  {
    h: "6. Higher tiers and vetting",
    p: [
      "Higher tiers may involve a verification process. We may decline or refund a higher-tier participation at our discretion where verification cannot reasonably be completed. The Curators' Circle tier carries the specific refund condition stated at the point of purchase.",
    ],
  },
  {
    h: "7. Availability",
    p: [
      "We provide the project on an “as is” basis and do not guarantee uninterrupted availability. The project may evolve or, in extreme circumstances, end. We will act in good faith toward participants if it does.",
    ],
  },
  {
    h: "8. Limitation of liability",
    p: [
      "To the maximum extent permitted by law, our liability arising from participation is limited to the amount you paid. We are not liable for indirect or consequential losses.",
    ],
  },
  {
    h: "9. Governing law",
    p: [
      "These terms are governed by the laws of Italy, without prejudice to mandatory consumer protections in your country of residence.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <article className="container-reading pb-24 pt-[12rem]">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-6 font-display text-4xl font-light text-[var(--color-text-primary)] sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
          Last updated: June 2026
        </p>

        <div className="mt-16 space-y-12">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-2xl font-light text-[var(--color-text-primary)]">
                {s.h}
              </h2>
              <div className="mt-4 space-y-4">
                {s.p.map((para, i) => (
                  <p
                    key={i}
                    className="font-body text-base leading-[1.7] text-[var(--color-text-secondary)]"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
      <Footer />
    </>
  );
}
