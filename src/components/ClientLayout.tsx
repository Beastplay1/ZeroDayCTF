"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);


  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`${theme === "dark" ? "dark bg-[#0a0a0a] text-white" : "bg-white text-gray-900"} min-h-screen flex flex-col transition-colors duration-300`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-grow container mx-auto px-4 py-8 mt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
