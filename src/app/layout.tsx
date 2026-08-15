import type { Metadata } from "next";
import { Onest, Source_Sans_3 } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { CookieConsent } from "@/components/CookieConsent";
import { JsonLd } from "@/components/JsonLd";
import {
  organizationJsonLd,
  rootMetadata,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

/** Onest — съвременен display с пълна кирилица (вкл. българска) */
const display = Onest({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["500", "600", "700", "800"],
});

/** Source Sans 3 — четим UI/body шрифт с отлична кирилица */
const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = rootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        {children}
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  );
}
