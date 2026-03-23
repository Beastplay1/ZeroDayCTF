import type { Metadata } from "next";
import { Geist, Geist_Mono, Koulen } from "next/font/google";
import { headers } from "next/headers";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const isAdmin = headersList.get("x-is-admin") === "1";
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${koulen.variable} antialiased overflow-x-hidden`}
      >
        <Providers>
          <ClientLayout isAdmin={isAdmin}>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
