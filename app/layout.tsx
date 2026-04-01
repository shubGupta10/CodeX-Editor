import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast'
import { Footer } from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://x-codex.vercel.app"),

  title: "CodeX - Online IDE",
  description: "Start coding instantly in your browser. No setup needed.",

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",

  openGraph: {
    title: "CodeX - Online IDE",
    description: "Start coding instantly in your browser. No setup needed.",
    url: "https://x-codex.vercel.app",
    siteName: "CodeX",
    images: [
      {
        url: "/ogImage.png",
        width: 1200,
        height: 630,
        alt: "CodeX IDE",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "CodeX - Online IDE",
    description: "Start coding instantly in your browser.",
    images: ["/ogImage.png"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProviderWrapper>
          <Navbar />
          <Toaster
            position="top-center"
            reverseOrder={false}
          />
          <Analytics />
          {children}
          <SpeedInsights />
          <Footer />
        </SessionProviderWrapper>
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="0856d315-1e69-49ea-bbff-dccf1667554b"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
