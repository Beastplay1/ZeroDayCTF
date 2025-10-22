import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Koulen } from "next/font/google";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const koulen = Koulen({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-koulen",
});

export const metadata: Metadata = {
  title: "ZerodayCTF",
  description:
    "ZeroDayCTF — a cybersecurity competition platform where hackers learn, compete, and evolve.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`bg-[#0a0a0a] text-green-400 min-h-screen flex flex-col overflow-x-hidden ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          <main className="flex-grow container mx-auto p-4 mt-35 pl-62">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
