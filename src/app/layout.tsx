import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HelioGuard Mars | Solar Storm Early Warning System",
  description: "Mars Solar Storm Early Warning System for the Challenger Center Space Challenge. Real-time monitoring and predictive analytics for astronaut safety.",
  keywords: ["space", "mars", "solar storm", "nasa", "astronaut", "mission control", "space weather"],
  authors: [{ name: "Challenger Center Space Challenge Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
