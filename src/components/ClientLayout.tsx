"use client";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientLayout({
  children,
  isAdmin = false,
  isLoggedIn = false,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
  isLoggedIn?: boolean;
}) {
  return (
    <div className="dark bg-[#0a0a0a] text-white min-h-screen flex flex-col">
      {!isAdmin && <Navbar initialIsLoggedIn={isLoggedIn} />}
      <main
        className={`flex-grow ${!isAdmin ? "container mx-auto px-4 py-8 mt-20" : ""}`}
      >
        {children}
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}
