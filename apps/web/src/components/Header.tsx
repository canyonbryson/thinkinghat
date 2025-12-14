"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Games", href: "#games" },
  { name: "How It Works", href: "#how-it-works" },
];

export default function Header() {
  const { user } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-hat-black/80 backdrop-blur-lg border-b border-hat-border/50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">
              🎩
            </span>
            <span className="text-xl font-bold hidden sm:block">
              ThinkingHat
            </span>
          </Link>

          {/* Desktop Nav */}
          {isLanding && (
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-hat-muted hover:text-hat-text transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </nav>
          )}

          {/* Auth buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/home"
                  className="btn-glow px-5 py-2 rounded-lg text-sm font-semibold"
                >
                  Go to Games
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="hidden sm:block text-hat-muted hover:text-hat-text transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="btn-glow px-5 py-2 rounded-lg text-sm font-semibold"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            {isLanding && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-hat-muted hover:text-hat-text"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isLanding && mobileMenuOpen && (
          <div className="md:hidden border-t border-hat-border py-4 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-hat-muted hover:text-hat-text transition-colors py-2"
              >
                {item.name}
              </a>
            ))}
            {!user && (
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-hat-muted hover:text-hat-text transition-colors py-2"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
