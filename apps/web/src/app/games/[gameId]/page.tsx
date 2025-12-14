"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@thinkinghat/backend/convex/_generated/api";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { t } from "@thinkinghat/i18n";
import { getOrCreateGuestIdentity } from "@/lib/guest";

type Mode = "single" | "two-player" | "party";
type PlayType = "online" | "local";

const gameEmojis: Record<string, string> = {
  mumbled: "🗣️",
  rebus: "🧩",
  riddles: "🎭",
};

const gameDescriptions: Record<string, string> = {
  mumbled: "Sound-alike puzzle game. See nonsense syllables, decode real phrases.",
  rebus: "Visual word puzzles. Position, spacing, and symbols hide the answer.",
  riddles: "Cryptic clues and wordplay. Think laterally to crack each one.",
};

const modeInfo = {
  single: { label: "Solo", desc: "Practice at your own pace", icon: "👤" },
  "two-player": { label: "Duel", desc: "Head-to-head competition", icon: "⚔️" },
  party: { label: "Party", desc: "3+ players, most fun!", icon: "🎉" },
};

const playTypeInfo = {
  online: { label: "Online", desc: "Play remotely with friends", icon: "🌐" },
  local: { label: "Local", desc: "Same device, pass & play", icon: "📱" },
};

export default function GameConfigPage() {
  const params = useParams<{ gameId: string }>();
  const router = useRouter();
  const { user } = useUser();
  const createRoom = useMutation(api.rooms.create);
  const [guest] = useState(() => getOrCreateGuestIdentity());

  const gameId = (params.gameId ?? "").toString();
  const [mode, setMode] = useState<Mode>("single");
  const [playType, setPlayType] = useState<PlayType>("online");
  const [totalRounds, setTotalRounds] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch categories for the game
  const categories = useQuery(api.games.listCategories, { gameId });

  const emoji = gameEmojis[gameId] || "🎮";
  const description = gameDescriptions[gameId] || "";

  const title = useMemo(() => {
    if (gameId === "mumbled") return t("game.mumbled.name");
    if (gameId === "rebus") return t("game.rebus.name");
    if (gameId === "riddles") return t("game.riddles.name");
    return gameId;
  }, [gameId]);

  async function onCreate() {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const rounds = Math.max(1, totalRounds);
      const displayName = user?.fullName ?? user?.username ?? guest.guestName;
      const result = await createRoom({
        gameId,
        mode,
        playType,
        config: {
          totalRounds: rounds,
          categorySlug: selectedCategory !== "all" ? selectedCategory : undefined,
        },
        guestId: user ? undefined : guest.guestId,
        displayName,
      });
      router.push(`/rooms/${result.code}`);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <header className="border-b border-hat-border/50 bg-hat-black/60 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 group">
            <span className="text-hat-muted group-hover:text-hat-text transition-colors">←</span>
            <span className="text-hat-muted group-hover:text-hat-text transition-colors">Back</span>
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

      <main className="container mx-auto px-6 py-12 max-w-2xl">
        {/* Game header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">{emoji}</div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-hat-muted">{description}</p>
        </div>

        {/* Config sections */}
        <div className="space-y-8">
          {/* Mode selection */}
          <div className="game-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Game Mode</h2>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(modeInfo) as [Mode, typeof modeInfo.single][]).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    mode === key
                      ? "border-hat-gold bg-hat-gold/10"
                      : "border-hat-border hover:border-hat-gold/50"
                  }`}
                >
                  <div className="text-2xl mb-2">{info.icon}</div>
                  <div className={`font-semibold ${mode === key ? "text-hat-gold" : ""}`}>
                    {info.label}
                  </div>
                  <div className="text-xs text-hat-muted mt-1">{info.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Play type selection */}
          <div className="game-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Play Type</h2>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(playTypeInfo) as [PlayType, typeof playTypeInfo.online][]).map(
                ([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setPlayType(key)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      playType === key
                        ? "border-hat-cyan bg-hat-cyan/10"
                        : "border-hat-border hover:border-hat-cyan/50"
                    }`}
                  >
                    <div className="text-2xl mb-2">{info.icon}</div>
                    <div className={`font-semibold ${playType === key ? "text-hat-cyan" : ""}`}>
                      {info.label}
                    </div>
                    <div className="text-xs text-hat-muted mt-1">{info.desc}</div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Game-specific options */}
          {gameId === "mumbled" && (
            <div className="game-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Game Options</h2>
              <div className="space-y-6">
                {/* Rounds */}
                <div>
                  <label className="block text-sm text-hat-muted mb-2">Number of Rounds</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={totalRounds}
                      onChange={(e) => setTotalRounds(Number(e.target.value))}
                      className="flex-1 accent-hat-gold"
                    />
                    <span className="text-2xl font-bold text-hat-gold w-12 text-center">
                      {totalRounds}
                    </span>
                  </div>
                </div>

                {/* Category selector */}
                <div>
                  <label className="block text-sm text-hat-muted mb-2">Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedCategory === "all"
                          ? "border-hat-pink bg-hat-pink/10"
                          : "border-hat-border hover:border-hat-pink/50"
                      }`}
                    >
                      <div className="text-xl mb-1">🎲</div>
                      <div className={`font-medium text-sm ${selectedCategory === "all" ? "text-hat-pink" : ""}`}>
                        All Categories
                      </div>
                    </button>
                    {categories?.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedCategory === cat.slug
                            ? "border-hat-pink bg-hat-pink/10"
                            : "border-hat-border hover:border-hat-pink/50"
                        }`}
                      >
                        <div className="text-xl mb-1">📝</div>
                        <div className={`font-medium text-sm ${selectedCategory === cat.slug ? "text-hat-pink" : ""}`}>
                          {cat.label}
                        </div>
                      </button>
                    ))}
                  </div>
                  {(!categories || categories.length === 0) && (
                    <p className="text-xs text-hat-muted mt-2">
                      More categories coming soon!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Create button */}
          <button
            onClick={onCreate}
            disabled={isCreating}
            className="w-full btn-glow py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating Room..." : `Create ${title} Room`}
          </button>
        </div>
      </main>
    </div>
  );
}
