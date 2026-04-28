import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://autodrop.in"),
  title: {
    default: "Autodrop | Automate Instagram Engagement & DMs",
    template: "%s | Autodrop"
  },
  description: "The premier Instagram automation platform built for creators. Reply to every comment, send DMs instantly, and capture leads while you sleep.",
  keywords: ["Instagram Automation", "Auto DM", "Comment Reply Bot", "Instagram Leads", "Creator Tools", "Autodrop", "Meta Business Partner"],
  authors: [{ name: "Autodrop" }],
  creator: "Autodrop",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://autodrop.in",
    siteName: "Autodrop",
    title: "Autodrop | Automate Instagram Engagement & DMs",
    description: "The premier Instagram automation platform built for creators. Reply to every comment, send DMs instantly, and capture leads while you sleep.",
    images: [{ url: "/autodrop_icon_transparent.png", width: 800, height: 800, alt: "Autodrop Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Autodrop | Automate Instagram Engagement & DMs",
    description: "The premier Instagram automation platform built for creators. Reply to every comment, send DMs instantly, and capture leads while you sleep.",
    images: ["/autodrop_icon_transparent.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="antialiased">
          <div className="noise-bg" />
          {children}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
