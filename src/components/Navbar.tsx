"use client";
import Link from "next/link";
import { Button } from "@heroui/react";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    google: any;
  }
}

interface NavbarProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export default function Navbar({ theme, toggleTheme }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");

  const changeLanguage = (lang: string) => {
    const langCode = lang === "EN" ? "en" : lang === "RU" ? "ru" : "hy";
    const translateSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (translateSelect) {
      translateSelect.value = langCode;
      translateSelect.dispatchEvent(new Event('change'));
      setCurrentLang(lang);
    }
  };

  useEffect(() => {
    const checkTranslateReady = setInterval(() => {
      if (window.google && window.google.translate) {
        clearInterval(checkTranslateReady);
      }
    }, 100);
    return () => clearInterval(checkTranslateReady);
  }, []);

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      <nav className={`fixed top-0 left-0 w-full backdrop-blur-sm z-50 ${theme === 'dark' ? 'bg-black/30' : 'bg-white/30'} border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className={`font-[Koulen] text-xl px-3 py-1 hover:text-zerogreen transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                Home
              </Link>
              <Link
                href="/challanges"
                className={`font-[Koulen] text-xl px-3 py-1 hover:text-zerogreen transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                Challenges
              </Link>
              <Link
                href="/leaderboard"
                className={`font-[Koulen] text-xl px-3 py-1 hover:text-zerogreen transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                Leaderboard
              </Link>
              <Link
                href="/about"
                className={`font-[Koulen] text-xl px-3 py-1 hover:text-zerogreen transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                About Us
              </Link>
              <Link
                href="/profile"
                className={`font-[Koulen] text-xl px-3 py-1 hover:text-zerogreen transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                Profile
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                isIconOnly
                onClick={toggleTheme}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}
                title="Toggle Theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </Button>
              
              <div className="relative">
                <select
                  onChange={(e) => changeLanguage(e.target.value)}
                  value={currentLang}
                  className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'} px-3 py-2 rounded-md text-sm font-bold cursor-pointer border-2 border-zerogreen/30 hover:border-zerogreen transition-colors`}
                >
                  <option value="EN">EN 🇺🇸</option>
                  <option value="RU">RU 🇷🇺</option>
                  <option value="AM">AM 🇦🇲</option>
                </select>
              </div>

              <Button
                as={Link}
                href="/signup"
                variant="solid"
                className="bg-[#09CC26] border-2 border-[#09CC26] rounded-sm text-lg px-4 py-2 transition-colors font-[Koulen] text-black hover:bg-[#07a020]"
              >
                Sign Up
              </Button>
              <Button
                as={Link}
                href="/signin"
                variant="bordered"
                className={`border-2 border-[#09CC26] rounded-sm font-[Koulen] text-lg px-4 py-2 transition-colors ${theme === 'dark' ? 'text-white bg-transparent' : 'text-gray-900 bg-transparent'} hover:bg-zerogreen/10`}
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex justify-between items-center py-4">
            <div className={`font-[Koulen] text-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>ZeroDayCTF</div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                isIconOnly
                onClick={toggleTheme}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </Button>

              <select
                onChange={(e) => changeLanguage(e.target.value)}
                value={currentLang}
                className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'} px-2 py-1 rounded text-xs font-bold cursor-pointer border border-zerogreen/30`}
              >
                <option value="EN">EN</option>
                <option value="RU">RU</option>
                <option value="AM">AM</option>
              </select>
              
              <label className="burger" htmlFor="burger">
                <input 
                  type="checkbox" 
                  id="burger"
                  checked={isOpen}
                  onChange={(e) => setIsOpen(e.target.checked)}
                />
                <span></span>
                <span></span>
                <span></span>
              </label>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ${
              isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex flex-col space-y-3 pb-4">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className={`font-[Koulen] text-lg px-3 py-2 border ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'} hover:text-zerogreen transition-colors text-center`}
              >
                Home
              </Link>
              <Link
                href="/challanges"
                onClick={() => setIsOpen(false)}
                className={`font-[Koulen] text-lg px-3 py-2 border ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'} hover:text-zerogreen transition-colors text-center`}
              >
                Challenges
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setIsOpen(false)}
                className={`font-[Koulen] text-lg px-3 py-2 border ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'} hover:text-zerogreen transition-colors text-center`}
              >
                Leaderboard
              </Link>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className={`font-[Koulen] text-lg px-3 py-2 border ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'} hover:text-zerogreen transition-colors text-center`}
              >
                About Us
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className={`font-[Koulen] text-lg px-3 py-2 border ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'} hover:text-zerogreen transition-colors text-center`}
              >
                Profile
              </Link>
              <Button
                as={Link}
                href="/signup"
                onClick={() => setIsOpen(false)}
                variant="solid"
                className="bg-[#09CC26] border-2 border-[#09CC26] rounded-sm text-lg px-3 py-2 transition-colors font-[Koulen] text-black w-full"
              >
                Sign Up
              </Button>
              <Button
                as={Link}
                href="/signin"
                onClick={() => setIsOpen(false)}
                variant="bordered"
                className={`border-2 border-[#09CC26] rounded-sm font-[Koulen] text-lg px-3 py-2 transition-colors w-full ${theme === 'dark' ? 'text-white bg-transparent' : 'text-gray-900 bg-transparent'}`}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
