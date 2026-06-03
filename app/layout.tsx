import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import { getLocale } from "@/lib/get-locale";
import { LocaleProvider } from "@/components/locale-provider";
import { CookieBanner } from "@/components/cookie-banner";
import { getDictionary } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_URL ?? "https://themillionairesdollar.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Millionaire's Dollar — Prove you exist",
    template: "%s — The Millionaire's Dollar",
  },
  description:
    "A cultural experiment. Millionaires pay €5 to declare publicly that they exist.",
  keywords: ["social experiment", "wealth", "culture", "project"],
  authors: [{ name: "The Curators" }],
  creator: "The Curators",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "The Millionaire's Dollar",
    description: "Millionaires have declared they exist. €5 each.",
    siteName: "The Millionaire's Dollar",
    locale: "en_US",
    images: [
      { url: "/api/og/default", width: 1200, height: 630, alt: "The Millionaire's Dollar" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@TheCurators",
    title: "The Millionaire's Dollar",
    description: "Millionaires have declared they exist. €5 each.",
    images: ["/api/og/default"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${cormorant.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <LocaleProvider locale={locale}>
          {/* dict is passed implicitly via provider; children read it through useLocale */}
          {children}
          <CookieBanner />
        </LocaleProvider>
        <noscript>
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              fontSize: "14px",
              color: "#a8a59e",
            }}
          >
            {dict.common.loading}…
          </div>
        </noscript>
      </body>
    </html>
  );
}
