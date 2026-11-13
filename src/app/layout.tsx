import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "ClosetMate — better outfits from the clothes you own",
    template: "%s · ClosetMate",
  },
  description:
    "ClosetMate is a personal wardrobe organizer and everyday outfit assistant. Catalog what you own, discover combinations, and decide what to wear in minutes.",
  applicationName: "ClosetMate",
  openGraph: {
    title: "ClosetMate — better outfits from the clothes you own",
    description:
      "A personal wardrobe organizer and everyday outfit assistant. Start with five items.",
    type: "website",
    images: ["/brand/og.svg"],
  },
  icons: {
    icon: [{ url: "/brand/mark.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-canvas text-ink">{children}</body>
    </html>
  );
}
