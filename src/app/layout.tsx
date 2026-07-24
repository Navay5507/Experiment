import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ReticleDev } from './reticle-dev';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.autodrop.in"),
  title: {
    default: "Autodrop | Automate Instagram Engagement & DMs",
    template: "%s | Autodrop"
  },
  description: "The ultimate Instagram growth engine for creators. Automate comment replies, send AI-powered DMs, set up Follow-Gates, and sell digital products on autopilot.",
  keywords: ["Instagram Automation", "Auto DM", "Comment Reply Bot", "Follow Gate", "Instagram Lead Capture", "Digital Product Store", "AI Instagram Bot", "Creator Monetization", "Autodrop", "Meta Business Partner"],
  authors: [{ name: "Autodrop" }],
  creator: "Autodrop",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.autodrop.in",
    siteName: "Autodrop",
    title: "Autodrop | Automate Instagram Engagement & DMs",
    description: "The ultimate Instagram growth engine for creators. Automate comment replies, send AI-powered DMs, set up Follow-Gates, and sell digital products on autopilot.",
    images: [{ url: "https://www.autodrop.in/autodrop_icon_transparent.png", width: 800, height: 800, alt: "Autodrop Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Autodrop | Automate Instagram Engagement & DMs",
    description: "The ultimate Instagram growth engine for creators. Automate comment replies, send AI-powered DMs, set up Follow-Gates, and sell digital products on autopilot.",
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
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    "name": "AutoDrop",
                    "url": "https://www.autodrop.in",
                    "logo": "https://www.autodrop.in/autodrop_icon_transparent.png",
                    "sameAs": ["https://www.instagram.com/autodrop.in/"],
                    "contactPoint": {
                      "@type": "ContactPoint",
                      "email": "support@autodrop.in",
                      "contactType": "customer support"
                    }
                  },
                  {
                    "@type": "SoftwareApplication",
                    "name": "AutoDrop",
                    "applicationCategory": "BusinessApplication",
                    "description": "The ultimate Instagram growth engine for creators. Automate comment replies, send AI-powered DMs, set up Follow-Gates, and sell digital products on autopilot.",
                    "operatingSystem": "Web",
                    "offers": {
                      "@type": "AggregateOffer",
                      "priceCurrency": "INR",
                      "lowPrice": "0",
                      "highPrice": "449",
                      "offerCount": "2"
                    }
                  }
                ]
              })
            }}
          />
        </head>
        <body className="antialiased">
          {process.env.NODE_ENV === 'development' ? <ReticleDev /> : null}
          <div className="noise-bg" />
          {children}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
