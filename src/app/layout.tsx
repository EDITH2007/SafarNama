import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/components/UserContext";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafarNama — Discover Hidden Gems in India",
  description: "SafarNama is a community-driven travel planning and discovery platform for India's offbeat trails, curated by actual travelers.",
  openGraph: {
    title: "SafarNama — Discover Hidden Gems in India",
    description: "SafarNama is a community-driven travel planning and discovery platform for India's offbeat trails, curated by actual travelers.",
    url: "https://safarnama.travel",
    siteName: "SafarNama",
    images: [
      {
        url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "SafarNama — Discover India's Hidden Gems",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SafarNama — Discover Hidden Gems in India",
    description: "SafarNama is a community-driven travel planning and discovery platform for India's offbeat trails, curated by actual travelers.",
    images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&h=630&q=80"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-earth-sand text-earth-charcoal font-sans">
          <ConvexClientProvider>
            <UserProvider>
              {children}
            </UserProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
