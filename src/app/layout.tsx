import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const metadata: Metadata = {
  title: {
    default: "Find My Fuel — Save Time & Money on Petrol",
    template: "%s | Find My Fuel",
  },
  description:
    "Save time and money. Find cheap fuel close by. Compare live petrol and diesel prices at 7,000+ UK stations with official CMA data updated every 30 minutes.",
  keywords: [
    "petrol prices",
    "fuel prices UK",
    "cheap petrol",
    "diesel prices",
    "fuel station map",
    "find cheap fuel",
    "petrol station near me",
  ],
  openGraph: {
    title: "Find My Fuel — Save Time & Money on Petrol",
    description:
      "Save time and money. Find cheap fuel close by. Compare live prices at 7,000+ UK fuel stations.",
    type: "website",
    siteName: "Find My Fuel",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find My Fuel — Save Time & Money on Petrol",
    description:
      "Save time and money. Find cheap fuel close by. Compare live prices at 7,000+ UK fuel stations.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const inner = (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );

  return clerkEnabled ? <ClerkProvider>{inner}</ClerkProvider> : inner;
}
