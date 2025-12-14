"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@thinkinghat/backend/convex/_generated/api";
import type { Id } from "@thinkinghat/backend/convex/_generated/dataModel";
import { t } from "@thinkinghat/i18n";
import Link from "next/link";

export function MumbledGameScreen({
  roomId,
  roomCode,
  isHost,
  guestId,
}: {
  roomId: Id<"rooms">;
  roomCode: string;
  isHost: boolean;
  guestId?: string;
}) {
  const router = useRouter();
  const state = useQuery(api.mumbled.getPublicState, { roomId, guestId });
  const submitAnswer = useMutation(api.mumbled.submitAnswer);
  const nextRound = useMutation(api.mumbled.nextRound);
  const skip = useMutation(api.mumbled.skip);

  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const phase = (state as any)?.phase as string | undefined;
  const round = (state as any)?.round as number | undefined;
  const totalRounds = (state as any)?.totalRounds as number | undefined;
  const prompt = (state as any)?.prompt as string | undefined;
  const revealedAnswer = (state as any)?.revealedAnswer as string | undefined;
  const scoreByPlayerId = ((state as any)?.scoreByPlayerId ?? {}) as Record<string, number>;

  const scores = useMemo(() => {
    return Object.entries(scoreByPlayerId)
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score);
  }, [scoreByPlayerId]);

  const totalScore = useMemo(() => {
    return scores.reduce((sum, s) => sum + s.score, 0);
  }, [scores]);

  async function onSubmit() {
    if (!answer.trim()) return;
    const res = await submitAnswer({ roomId, answer, guestId });
    setAnswer("");
    setStatus(res.correct ? t("mumbled.correct") : t("mumbled.incorrect"));
  }

  async function onSkip() {
    await skip({ roomId, guestId });
  }

  async function onNextRound() {
    setStatus(null);
    await nextRound({ roomId, guestId });
  }

  // Loading state
  if (!state) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-hat-muted animate-pulse">Loading game...</div>
      </div>
    );
  }

  // Finished screen
  if (phase === "finished") {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        {/* Trophy icon */}
        <div className="text-6xl mb-6">🏆</div>
        
        <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
        <p className="text-hat-muted mb-8">
          You completed {totalRounds} rounds
        </p>

        {/* Final answer reveal */}
        {revealedAnswer && (
          <div className="game-card rounded-xl p-4 mb-8">
            <div className="text-xs text-hat-muted uppercase tracking-wider mb-1">
              Final Answer
            </div>
            <div className="text-xl font-bold text-hat-gold">{revealedAnswer}</div>
          </div>
        )}

        {/* Scores */}
        <div className="game-card rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Final Scores</h3>
          {scores.length > 0 ? (
            <div className="space-y-3">
              {scores.map((s, idx) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    idx === 0 ? "bg-hat-gold/20 border border-hat-gold/30" : "bg-hat-dark"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🎮"}
                    </span>
                    <span className={idx === 0 ? "font-bold text-hat-gold" : ""}>
                      Player {idx + 1}
                    </span>
                  </div>
                  <span className={`text-xl font-bold ${idx === 0 ? "text-hat-gold" : ""}`}>
                    {s.score}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-hat-muted">
              Total Score: <span className="text-2xl font-bold text-hat-text">{totalScore}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/games/mumbled`}
            className="btn-glow px-6 py-3 rounded-lg font-semibold"
          >
            Play Again
          </Link>
          <Link
            href="/home"
            className="btn-outline px-6 py-3 rounded-lg font-semibold"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Playing / Round Over screens
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with round and score */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗣️</span>
          <span className="text-hat-muted">
            Round {round}/{totalRounds}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-hat-dark px-4 py-2 rounded-lg">
          <span className="text-hat-muted text-sm">Score:</span>
          <span className="text-xl font-bold text-hat-gold">{totalScore}</span>
        </div>
      </div>

      {/* Prompt card */}
      <div className="game-card rounded-2xl p-8 mb-6 text-center">
        <div className="text-xs text-hat-muted uppercase tracking-wider mb-4">
          {t("mumbled.promptLabel")}
        </div>
        <div className="text-3xl md:text-4xl font-bold text-hat-text leading-relaxed">
          {prompt}
        </div>
      </div>

      {/* Status message */}
      {status && (
        <div
          className={`text-center py-3 px-4 rounded-lg mb-6 ${
            status === t("mumbled.correct")
              ? "bg-hat-emerald/20 text-hat-emerald border border-hat-emerald/30"
              : "bg-hat-pink/20 text-hat-pink border border-hat-pink/30"
          }`}
        >
          {status}
        </div>
      )}

      {/* Playing phase: answer input */}
      {phase === "playing" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void onSubmit();
              }}
              placeholder={t("mumbled.yourAnswer")}
              className="flex-1 bg-hat-dark border border-hat-border rounded-lg px-4 py-3 text-hat-text placeholder:text-hat-muted focus:outline-none focus:border-hat-gold transition-colors"
            />
            <button
              onClick={onSubmit}
              className="btn-glow px-6 py-3 rounded-lg font-semibold"
            >
              {t("mumbled.submit")}
            </button>
          </div>
          {isHost && (
            <button
              onClick={onSkip}
              className="w-full btn-outline py-3 rounded-lg text-sm"
            >
              {t("mumbled.skip")} (Reveal Answer)
            </button>
          )}
        </div>
      )}

      {/* Round over phase */}
      {phase === "roundOver" && (
        <div className="space-y-6">
          {/* Revealed answer */}
          <div className="game-card rounded-xl p-6 text-center">
            <div className="text-xs text-hat-muted uppercase tracking-wider mb-2">
              {t("mumbled.revealedAnswer")}
            </div>
            <div className="text-2xl font-bold text-hat-emerald">{revealedAnswer}</div>
          </div>

          {/* Next round button (host only) */}
          {isHost && (
            <button
              onClick={onNextRound}
              className="w-full btn-glow py-4 rounded-lg font-semibold text-lg"
            >
              {t("mumbled.nextRound")} →
            </button>
          )}
          {!isHost && (
            <div className="text-center text-hat-muted">
              Waiting for host to continue...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
