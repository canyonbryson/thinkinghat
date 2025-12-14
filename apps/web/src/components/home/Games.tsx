"use client";

const games = [
  {
    id: "mumbled",
    name: "Mumbled",
    emoji: "🗣️",
    color: "hat-gold",
    description: "Sound-alike puzzle game. See nonsense syllables, decode real phrases.",
    example: '"Sigh Cub Her Monday" → Cyber Monday',
    difficulty: ["Easy", "Medium", "Hard"],
  },
  {
    id: "rebus",
    name: "Rebus",
    emoji: "🧩",
    color: "hat-cyan",
    description: "Visual word puzzles. Position, spacing, and symbols hide the answer.",
    example: '"jobINjob" → In between jobs',
    difficulty: ["Easy", "Medium", "Hard"],
  },
  {
    id: "riddles",
    name: "Riddles",
    emoji: "🎭",
    color: "hat-pink",
    description: "Cryptic clues and wordplay. Think laterally to crack each one.",
    example: '"I\'m floating right behind" → Rafter',
    difficulty: ["Easy", "Medium", "Hard"],
  },
];

export default function Games() {
  return (
    <section id="games" className="py-24 lg:py-32 relative">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Three Games, <span className="text-shimmer">One Platform</span>
          </h2>
          <p className="text-xl text-hat-muted max-w-2xl mx-auto">
            Each game supports single player, two-player, and party modes. 
            Play online or locally with friends.
          </p>
        </div>

        {/* Games grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {games.map((game) => (
            <div
              key={game.id}
              className="game-card rounded-2xl p-8 space-y-6 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="text-5xl">{game.emoji}</div>
                <div className="flex gap-1">
                  {game.difficulty.map((d, i) => (
                    <span
                      key={d}
                      className={`w-2 h-2 rounded-full ${
                        i === 0 ? "bg-hat-emerald" : i === 1 ? "bg-hat-gold" : "bg-hat-pink"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Title */}
              <h3 className={`text-3xl font-bold text-${game.color}`}>
                {game.name}
              </h3>

              {/* Description */}
              <p className="text-hat-muted leading-relaxed">
                {game.description}
              </p>

              {/* Example */}
              <div className="bg-hat-dark/50 rounded-xl p-4 border border-hat-border">
                <div className="text-xs text-hat-muted uppercase tracking-wider mb-2">
                  Example
                </div>
                <div className="font-mono text-sm text-hat-text">
                  {game.example}
                </div>
              </div>

              {/* Modes */}
              <div className="flex gap-2 flex-wrap">
                {["Single", "2P", "Party"].map((mode) => (
                  <span
                    key={mode}
                    className="px-3 py-1 bg-hat-border/50 rounded-full text-xs text-hat-muted"
                  >
                    {mode}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon teaser */}
        <div className="mt-16 text-center">
          <p className="text-hat-muted">
            More games coming soon: Emoji Puzzles, Anagrams, Trivia...
          </p>
        </div>
      </div>
    </section>
  );
}

