import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Navbar from "@/components/Navbar";
import {Toaster} from 'react-hot-toast'
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
  title: "CodeX - AI-Powered Cloud IDE",
  description: "CodeX is an AI-powered cloud IDE that helps developers write, debug, and deploy code efficiently.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProviderWrapper>
    <html lang="en">
    <head>
      <Script
      src="https://cloud.umami.is/script.js"
      data-website-id="0856d315-1e69-49ea-bbff-dccf1667554b"
      strategy="lazyOnload"
      />
    </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar/>
        <Toaster 
          position="top-center"
          reverseOrder={false}
        />
        <Analytics/>
        {children}
        <SpeedInsights/>
        <Footer/>
      </body>
    </html>
    </SessionProviderWrapper>
  );
}
