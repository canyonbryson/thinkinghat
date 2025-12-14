"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const examplePuzzles = [
  { game: "Mumbled", clue: "Sigh Cub Her Monday", answer: "Cyber Monday" },
  { game: "Rebus", clue: "jobINjob", answer: "In between jobs" },
  { game: "Riddles", clue: "I'm floating right behind", answer: "Rafter" },
];

export default function Hero() {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPuzzle((prev) => (prev + 1) % examplePuzzles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const puzzle = examplePuzzles[currentPuzzle];

  return (
    <section className="hero-gradient grid-pattern relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-hat-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-hat-cyan/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 py-24 lg:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 feature-badge px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-hat-cyan rounded-full animate-pulse" />
              Cross-platform party games
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
              <span className="text-hat-text">Party Games</span>
              <br />
              <span className="text-shimmer">Reimagined</span>
            </h1>
            
            <p className="text-xl text-hat-muted max-w-lg leading-relaxed">
              ThinkingHat brings Jackbox-style word games to any device. 
              Host on TV, play on phones. Three games, endless laughs.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/sign-up">
                <button className="btn-glow px-8 py-4 rounded-xl text-lg">
                  Start Playing Free
                </button>
              </Link>
              <Link href="#games">
                <button className="btn-outline px-8 py-4 rounded-xl text-lg">
                  View Games
                </button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-hat-gold">3</div>
                <div className="text-sm text-hat-muted">Launch Games</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-hat-cyan">∞</div>
                <div className="text-sm text-hat-muted">Players</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-hat-pink">📱🖥️</div>
                <div className="text-sm text-hat-muted">Any Device</div>
              </div>
            </div>
          </div>
          
          {/* Right: Interactive puzzle preview */}
          <div className="relative">
            <div className="game-card rounded-3xl p-8 space-y-6 float">
              <div className="flex items-center justify-between">
                <span className="text-hat-muted text-sm uppercase tracking-wider">
                  Live Preview
                </span>
                <span className="px-3 py-1 bg-hat-gold/20 text-hat-gold rounded-full text-sm font-medium">
                  {puzzle.game}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="text-sm text-hat-muted">Solve this:</div>
                <div className="text-4xl lg:text-5xl font-bold text-center py-8 bg-hat-dark/50 rounded-2xl border border-hat-border">
                  {puzzle.clue}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-hat-muted">Answer:</div>
                <div className="text-2xl font-semibold text-hat-emerald">
                  {puzzle.answer}
                </div>
              </div>
              
              {/* Puzzle dots indicator */}
              <div className="flex justify-center gap-2 pt-4">
                {examplePuzzles.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPuzzle(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentPuzzle
                        ? "bg-hat-gold w-6"
                        : "bg-hat-border hover:bg-hat-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Room code badge */}
            <div className="absolute -bottom-4 -left-4 game-card rounded-xl px-4 py-3">
              <div className="text-xs text-hat-muted mb-1">Room Code</div>
              <div className="font-mono text-xl font-bold tracking-widest text-hat-cyan">
                ABCD
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
