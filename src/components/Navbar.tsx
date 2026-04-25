"use client";
import Link from "next/link";
import { Button } from "@heroui/react";
import { useState, useEffect } from "react";
import { UserSearch } from "@/components/UserSearch";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import "@/styles/navbar.css";

export function Navbar({ initialIsLoggedIn = false }: { initialIsLoggedIn?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
        });
        const data = await res.json();
        setIsLoggedIn(Boolean(data.authenticated));
      } catch {
        setIsLoggedIn(false);
      }
    };
    loadSession();
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setIsLoggedIn(false);
    window.location.replace("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full backdrop-blur-sm z-50 bg-black/30 border-b border-gray-800">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              {[
                ["/", "Home"],
                ["/challanges", "Challenges"],
                ["/leaderboard", "Leaderboard"],
                ["/about", "About Us"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="font-[Koulen] text-xl px-3 py-1 text-white hover:text-zerogreen transition-colors"
                >
                  {label}
                </Link>
              ))}
              {isLoggedIn && (
                <Link
                  href="/profile"
                  className="font-[Koulen] text-xl px-3 py-1 text-white hover:text-zerogreen transition-colors"
                >
                  Profile
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {isLoggedIn && <NotificationsDropdown />}
              <UserSearch />
              <div className="relative">
                <select className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-bold cursor-pointer border-2 border-zerogreen/30 hover:border-zerogreen transition-colors">
                  <option value="EN">EN</option>
                  <option value="RU">RU</option>
                  <option value="AM">AM</option>
                </select>
              </div>
              {!isLoggedIn ? (
                <>
                  <Button
                    as={Link}
                    href="/signup"
                    variant="solid"
                    className="signup bg-[#09CC26] border-2 border-[#09CC26] rounded-sm text-lg px-4 py-2 transition-colors font-[Koulen] text-white hover:bg-[#07a020]"
                  >
                    Sign Up
                  </Button>
                  <Button
                    as={Link}
                    href="/signin"
                    variant="bordered"
                    className="signin border-2 border-[#09CC26] rounded-sm font-[Koulen] text-lg px-4 py-2 transition-colors text-white bg-transparent hover:bg-zerogreen/10"
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSignOut}
                    variant="bordered"
                    className="signin border-2 border-[#09CC26] rounded-sm font-[Koulen] text-lg px-4 py-2 transition-colors text-white bg-transparent hover:bg-zerogreen/10"
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex justify-between items-center py-4">
            <div className="font-[Koulen] text-2xl text-white">ZeroDayCTF</div>
            <div className="flex items-center gap-2">
              {isLoggedIn && <NotificationsDropdown />}
              <div className="sm:block sm:px-1 sm:w-52">
                <UserSearch />
              </div>
              <select className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-bold cursor-pointer border border-zerogreen/30">
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
              {[
                ["/", "Home"],
                ["/challanges", "Challenges"],
                ["/leaderboard", "Leaderboard"],
                ["/about", "About Us"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="font-[Koulen] text-lg px-3 py-2 border border-gray-700 text-white hover:text-zerogreen transition-colors text-center"
                >
                  {label}
                </Link>
              ))}
              {isLoggedIn && (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="font-[Koulen] text-lg px-3 py-2 border border-gray-700 text-white hover:text-zerogreen transition-colors text-center"
                >
                  Profile
                </Link>
              )}
              {!isLoggedIn ? (
                <>
                  <Button
                    as={Link}
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    variant="solid"
                    className="signup bg-[#09CC26] border-2 border-[#09CC26] rounded-sm text-lg px-3 py-2 transition-colors font-[Koulen] text-white w-full"
                  >
                    Sign Up
                  </Button>
                  <Button
                    as={Link}
                    href="/signin"
                    onClick={() => setIsOpen(false)}
                    variant="bordered"
                    className="signin border-2 border-[#09CC26] rounded-sm font-[Koulen] text-lg px-3 py-2 transition-colors w-full text-white bg-transparent"
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                  variant="bordered"
                  className="signin border-2 border-[#09CC26] rounded-sm font-[Koulen] text-lg px-3 py-2 transition-colors w-full text-white bg-transparent"
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
