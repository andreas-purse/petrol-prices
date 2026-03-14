import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Petrol Prices UK - Find Cheap Fuel Near You",
  description:
    "Compare live petrol and diesel prices at thousands of UK fuel stations. Find the cheapest fuel near you with our interactive map.",
  openGraph: {
    title: "Petrol Prices UK",
    description: "Compare live fuel prices at thousands of UK stations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
