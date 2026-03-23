import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "../globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZerodayCTF Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${geistMono.variable} antialiased`}>{children}</div>;
}
