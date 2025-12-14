"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@thinkinghat/backend/convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { t } from "@thinkinghat/i18n";

const gameEmojis: Record<string, string> = {
  mumbled: "🗣️",
  rebus: "🧩",
  riddles: "🎭",
};

const gameColors: Record<string, string> = {
  mumbled: "hat-gold",
  rebus: "hat-cyan",
  riddles: "hat-pink",
};

export default function HomePage() {
  const { user } = useUser();
  const games = useQuery(api.games.list);

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <header className="border-b border-hat-border/50 bg-hat-black/60 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🎩</span>
            <span className="text-xl font-bold">ThinkingHat</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Link href="/sign-in" className="text-hat-muted hover:text-hat-text transition-colors">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Page title */}
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">{t("gamesTitle")}</h1>
          <p className="text-hat-muted">Choose a game to create a room, or join an existing one.</p>
        </div>

        {/* Loading state */}
        {games === undefined && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="game-card rounded-2xl p-6 animate-pulse">
                <div className="h-12 w-12 bg-hat-border rounded-xl mb-4" />
                <div className="h-6 w-24 bg-hat-border rounded mb-2" />
                <div className="h-4 w-full bg-hat-border rounded mb-4" />
                <div className="h-10 w-28 bg-hat-border rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {games !== undefined && games.length === 0 && (
          <div className="game-card rounded-2xl p-8 text-center max-w-xl mx-auto">
            <div className="text-5xl mb-4">🎲</div>
            <h2 className="text-xl font-bold mb-2">No games available yet</h2>
            <p className="text-hat-muted mb-6">
              The games database needs to be seeded. Run the following command:
            </p>
            <code className="block bg-hat-dark px-4 py-3 rounded-lg text-sm text-hat-cyan font-mono mb-6">
              pnpm --filter @thinkinghat/backend seed
            </code>
            <p className="text-hat-muted text-sm">Then refresh this page.</p>
          </div>
        )}

        {/* Games grid */}
        {games && games.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {games.map((g) => {
              const emoji = gameEmojis[g.gameId] || "🎮";
              const colorClass = gameColors[g.gameId] || "hat-gold";
              const isActive = g.status === "active";

              return (
                <div key={g._id} className="game-card rounded-2xl p-6 flex flex-col">
                  {/* Emoji + status badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{emoji}</div>
                    {!isActive && (
                      <span className="px-2 py-1 bg-hat-border/50 rounded-full text-xs text-hat-muted">
                        {t("comingSoon")}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl font-bold mb-2 text-${colorClass}`}>
                    {t(g.nameKey)}
                  </h3>

                  {/* Description */}
                  {g.descriptionKey && (
                    <p className="text-hat-muted text-sm mb-6 flex-1">
                      {t(g.descriptionKey)}
                    </p>
                  )}

                  {/* CTA */}
                  {isActive ? (
                    <Link
                      href={`/games/${g.gameId}`}
                      className="btn-glow px-5 py-2.5 rounded-lg text-sm font-semibold text-center"
                    >
                      {t("createRoom")}
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="btn-outline px-5 py-2.5 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
                    >
                      {t("comingSoon")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Join room section */}
        <div className="border-t border-hat-border pt-10">
          <h2 className="text-xl font-bold mb-4">Have a room code?</h2>
          <p className="text-hat-muted mb-6">
            Enter the code shared by your host to join their game session.
          </p>
          <Link
            href="/rooms/join"
            className="btn-outline px-6 py-3 rounded-lg text-sm font-semibold inline-block"
          >
            {t("joinRoom")}
          </Link>
        </div>
      </main>
    </div>
  );
}
