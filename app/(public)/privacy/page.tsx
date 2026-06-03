import type { Metadata } from "next";
import { Footer } from "@/components/home/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How The Millionaire's Dollar handles your data.",
};

const SECTIONS: Array<{ h: string; p: string[] }> = [
  {
    h: "1. Who we are",
    p: [
      "The Millionaire's Dollar (“the project”, “we”) is operated by The Curators. This policy explains what personal data we collect, why, and the rights you have under the GDPR and equivalent laws.",
      "For any privacy request, contact privacy@themillionairesdollar.com.",
    ],
  },
  {
    h: "2. What we collect",
    p: [
      "When you add yourself to the Wall, we collect: your email address, a display name (and your choice to show it as initials or in full), country, and optionally a city, a year, and a one-line message.",
      "For higher tiers you may additionally provide a LinkedIn URL, a business email, a description of your source of wealth, and a phone number, used solely for verification and concierge contact.",
      "Payment is processed by Stripe. We never see or store your full card details; we retain only a payment reference.",
    ],
  },
  {
    h: "3. What is shown publicly",
    p: [
      "Your tile shows only what you choose: initials or full name, country, optional city, optional year, and your optional one line. Your email, phone, business data and exact location are never published.",
      "On the map, your location is shown only at city level with a random offset of several kilometres. Your precise position is never derived or displayed.",
    ],
  },
  {
    h: "4. Legal basis",
    p: [
      "We process participation data on the basis of your consent and to perform the service you requested. Newsletter and future-contact processing rely on separate, explicit consents you may withdraw at any time.",
    ],
  },
  {
    h: "5. Sharing",
    p: [
      "We use a small number of processors: Supabase (database/hosting), Stripe (payments), Resend (transactional email), Vercel (hosting/CDN) and Mapbox (map rendering). We do not sell personal data, ever.",
    ],
  },
  {
    h: "6. Retention",
    p: [
      "Public tile data is retained for as long as the project exists or until you request removal. Minimal financial records are retained as required by law. Newsletter data is retained until you unsubscribe.",
    ],
  },
  {
    h: "7. Your rights",
    p: [
      "You may access, correct, export, or erase your data, and object to or restrict processing. To remove your tile, email privacy@themillionairesdollar.com or use the deletion request flow. Removal takes the tile down; per our terms, contributions are not refunded.",
    ],
  },
  {
    h: "8. Cookies",
    p: [
      "We use a single functional cookie to remember your language preference, and authentication cookies only within the private admin area. We do not use advertising or cross-site tracking cookies.",
    ],
  },
  {
    h: "9. Changes",
    p: [
      "We may update this policy. Material changes will be noted here with a revised date.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <article className="container-reading pb-24 pt-[12rem]">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-6 font-display text-4xl font-light text-[var(--color-text-primary)] sm:text-5xl">
          Privacy Policy
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
