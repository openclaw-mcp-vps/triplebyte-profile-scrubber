import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  metadataBase: new URL("https://triplebyte-profile-scrubber.com"),
  title: "Triplebyte Profile Scrubber | Remove your data from defunct recruiting platforms",
  description:
    "Automate GDPR/CCPA deletion requests across dead recruiting platforms, then monitor your old profiles until they disappear.",
  keywords: [
    "privacy tools",
    "data deletion",
    "triplebyte",
    "GDPR",
    "CCPA",
    "profile removal"
  ],
  openGraph: {
    type: "website",
    title: "Triplebyte Profile Scrubber",
    description:
      "Automatically request profile deletion from shutdown recruiting platforms and track compliance.",
    url: "https://triplebyte-profile-scrubber.com",
    siteName: "Triplebyte Profile Scrubber"
  },
  twitter: {
    card: "summary_large_image",
    title: "Triplebyte Profile Scrubber",
    description:
      "Stop stale recruiting profiles from staying public forever. Send deletion requests and track compliance from one dashboard."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
