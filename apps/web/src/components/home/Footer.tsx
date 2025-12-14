"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-hat-border bg-hat-dark/50">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎩</span>
              <span className="text-2xl font-bold">ThinkingHat</span>
            </div>
            <p className="text-hat-muted max-w-sm">
              Cross-platform party games that bring people together. 
              Play on web or mobile, online or in the same room.
            </p>
            <div className="flex gap-4 pt-2">
              <span className="text-2xl opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                📱
              </span>
              <span className="text-2xl opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                🖥️
              </span>
            </div>
          </div>

          {/* Games */}
          <div className="space-y-4">
            <h4 className="font-semibold text-hat-gold">Games</h4>
            <ul className="space-y-2 text-hat-muted">
              <li>
                <Link href="/home" className="hover:text-hat-text transition-colors">
                  Mumbled
                </Link>
              </li>
              <li>
                <Link href="/home" className="hover:text-hat-text transition-colors">
                  Rebus
                </Link>
              </li>
              <li>
                <Link href="/home" className="hover:text-hat-text transition-colors">
                  Riddles
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-hat-gold">Play</h4>
            <ul className="space-y-2 text-hat-muted">
              <li>
                <Link href="/rooms/join" className="hover:text-hat-text transition-colors">
                  Join Room
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-hat-text transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-hat-text transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-hat-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-hat-muted">
          <p>© {new Date().getFullYear()} ThinkingHat Games. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-hat-text cursor-pointer transition-colors">
              Privacy
            </span>
            <span className="hover:text-hat-text cursor-pointer transition-colors">
              Terms
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
