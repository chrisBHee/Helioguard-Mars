import React from 'react';
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased text-white min-h-screen bg-[#0B0B15] relative overflow-x-hidden`}>
        {/* Background gradients/blobs to match the cosmic feel */}
        <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 blur-[120px] rounded-full"></div>
          <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[130px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-indigo-900/20 blur-[100px] rounded-full"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
