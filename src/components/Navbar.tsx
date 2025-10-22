"use client";
import Link from "next/link";
import { Button } from "@heroui/react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full backdrop-blur-sm bg-transparent z-50">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex justify-center items-center space-x-10 py-4">
          <Link
            href="/"
            className="font-[Koulen] text-white text-xl px-3 py-1 hover:text-zerogreen transition-colors"
          >
            Home
          </Link>
          <Link
            href="/challanges"
            className="font-[Koulen] text-white text-xl px-3 py-1 hover:text-zerogreen transition-colors"
          >
            Challenges
          </Link>
          <Link
            href="/leaderboard"
            className="font-[Koulen] text-white text-xl px-3 py-1 hover:text-zerogreen transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            href="/about"
            className="font-[Koulen] text-white text-xl px-3 py-1 hover:text-zerogreen transition-colors"
          >
            About Us
          </Link>
          <Button
            as={Link}
            href="/signup"
            variant="solid"
            className="bg-[#09CC26] border-[5px] border-[#09CC26] rounded-sm text-xl px-3 py-1 transition-colors font-[Koulen] text-white signup"
          >
            Sign Up
          </Button>
          <Button
            as={Link}
            href="/signin"
            variant="bordered"
            className="border-[5px] border-[#09CC26] rounded-sm font-[Koulen] text-xl px-3 py-1 transition-colors font-[Koulen] text-white signin bg-transparent"
          >
            Sign In
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex justify-between items-center py-4">
          <div className="font-[Koulen] text-white text-2xl">ZeroDayCTF</div>
          
          {/* Burger Menu Button */}
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

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col space-y-4 pb-4">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="font-[Koulen] text-white text-lg px-3 py-2 border border-gray-700 hover:text-zerogreen transition-colors text-center"
            >
              Home
            </Link>
            <Link
              href="/challanges"
              onClick={() => setIsOpen(false)}
              className="font-[Koulen] text-white text-lg px-3 py-2 border border-gray-700 hover:text-zerogreen transition-colors text-center"
            >
              Challenges
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setIsOpen(false)}
              className="font-[Koulen] text-white text-lg px-3 py-2 border border-gray-700 hover:text-zerogreen transition-colors text-center"
            >
              Leaderboard
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="font-[Koulen] text-white text-lg px-3 py-2 border border-gray-700 hover:text-zerogreen transition-colors text-center"
            >
              About Us
            </Link>
            <Button
              as={Link}
              href="/signup"
              onClick={() => setIsOpen(false)}
              variant="solid"
              className="bg-[#09CC26] border-[5px] border-[#09CC26] rounded-sm text-lg px-3 py-2 transition-colors font-[Koulen] text-white w-full signup"
            >
              Sign Up
            </Button>
            <Button
              as={Link}
              href="/signin"
              onClick={() => setIsOpen(false)}
              variant="bordered"
              className="border-[5px] border-[#09CC26] rounded-sm font-[Koulen] text-lg px-3 py-2 transition-colors font-[Koulen] text-white bg-transparent w-full signin"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}