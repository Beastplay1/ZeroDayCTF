import type { Metadata } from "next";
import { Geist, Geist_Mono, Koulen } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          .goog-te-banner-frame { display: none !important; }
          .goog-te-gadget { color: transparent !important; }
          body { top: 0 !important; }
          #google_translate_element { display: none; }
        `}</style>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${koulen.variable} antialiased overflow-x-hidden`}>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
