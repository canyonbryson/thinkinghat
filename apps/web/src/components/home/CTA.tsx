"use client";

import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-hat-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="game-card rounded-3xl p-12 lg:p-16 text-center space-y-8 max-w-4xl mx-auto">
          <div className="text-6xl">🎩</div>
          
          <h2 className="text-4xl lg:text-5xl font-bold">
            Ready for <span className="text-shimmer">Game Night</span>?
          </h2>
          
          <p className="text-xl text-hat-muted max-w-xl mx-auto">
            Join thousands of players solving puzzles, hosting parties, 
            and having a blast with friends and family.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/sign-up">
              <button className="btn-glow px-10 py-4 rounded-xl text-lg w-full sm:w-auto">
                Create Free Account
              </button>
            </Link>
            <Link href="/home">
              <button className="btn-outline px-10 py-4 rounded-xl text-lg w-full sm:w-auto">
                Play as Guest
              </button>
            </Link>
            <Link href="/rooms/join">
              <button className="btn-outline px-10 py-4 rounded-xl text-lg w-full sm:w-auto">
                Join a Room
              </button>
            </Link>
          </div>

          <p className="text-sm text-hat-muted">
            No credit card required • Works on any device
          </p>
        </div>
      </div>
    </section>
  );
}

