"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@thinkinghat/backend/convex/_generated/api";
import type { Id } from "@thinkinghat/backend/convex/_generated/dataModel";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

type Difficulty = "easy" | "medium" | "hard";

export default function AdminDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const isAdmin = useQuery(api.admin.checkAdmin);
  const games = useQuery(api.admin.listGames, isAdmin?.isAdmin ? {} : "skip");
  const [selectedGameId, setSelectedGameId] = useState<string>("mumbled");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");
  const [editingPuzzle, setEditingPuzzle] = useState<Id<"puzzles"> | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const categories = useQuery(
    api.admin.listCategories,
    isAdmin?.isAdmin && selectedGameId ? { gameId: selectedGameId } : "skip"
  );

  const puzzles = useQuery(
    api.admin.listPuzzles,
    isAdmin?.isAdmin
      ? {
          gameId: selectedGameId,
          categorySlug: selectedCategory !== "all" ? selectedCategory : undefined,
          difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
          limit: 100,
        }
      : "skip"
  );

  const createPuzzle = useMutation(api.admin.createPuzzle);
  const updatePuzzle = useMutation(api.admin.updatePuzzle);
  const deletePuzzle = useMutation(api.admin.deletePuzzle);

  // Redirect if not admin
  if (isAdmin === undefined) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-hat-muted">Loading...</div>
      </div>
    );
  }

  if (!isAdmin.isAdmin) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-hat-muted mb-3">You must be an admin to access this page.</p>
          <p className="text-hat-muted mb-6 text-sm max-w-md">
            If you set Clerk <code>publicMetadata.isAdmin = true</code> but still see this, make sure your Clerk JWT
            template named <code>convex</code> includes an <code>isAdmin</code> (or <code>public_metadata.isAdmin</code>)
            claim, then sign out/in to refresh your token.
          </p>
          <Link href="/home" className="btn-glow px-6 py-3 rounded-lg font-semibold">
            Return Home
          </Link>
        </div>
      </div>
    );
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
            <span className="text-sm text-hat-muted">Admin Dashboard</span>
            {user && <UserButton afterSignOutUrl="/" />}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Filters */}
        <div className="game-card rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Game filter */}
            <div>
              <label className="block text-sm text-hat-muted mb-2">Game</label>
              <select
                value={selectedGameId}
                onChange={(e) => {
                  setSelectedGameId(e.target.value);
                  setSelectedCategory("all");
                }}
                className="w-full bg-hat-dark border border-hat-border rounded-lg px-4 py-2 text-hat-text focus:outline-none focus:border-hat-gold"
              >
                {games?.map((g) => (
                  <option key={g._id} value={g.gameId}>
                    {g.gameId}
                  </option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div>
              <label className="block text-sm text-hat-muted mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-hat-dark border border-hat-border rounded-lg px-4 py-2 text-hat-text focus:outline-none focus:border-hat-gold"
              >
                <option value="all">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat.slug}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty filter */}
            <div>
              <label className="block text-sm text-hat-muted mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | "all")}
                className="w-full bg-hat-dark border border-hat-border rounded-lg px-4 py-2 text-hat-text focus:outline-none focus:border-hat-gold"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Create button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowCreateForm(true);
              setEditingPuzzle(null);
            }}
            className="btn-glow px-6 py-3 rounded-lg font-semibold"
          >
            + Create New Puzzle
          </button>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingPuzzle) && (
          <PuzzleForm
            gameId={selectedGameId}
            categories={categories ?? []}
            puzzleId={editingPuzzle}
            onClose={() => {
              setShowCreateForm(false);
              setEditingPuzzle(null);
            }}
            onCreate={createPuzzle}
            onUpdate={updatePuzzle}
          />
        )}

        {/* Puzzles table */}
        <div className="game-card rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Puzzles ({puzzles?.length ?? 0})
          </h2>
          {puzzles && puzzles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hat-border">
                    <th className="text-left py-3 px-4 text-sm text-hat-muted">Game</th>
                    <th className="text-left py-3 px-4 text-sm text-hat-muted">Prompt</th>
                    <th className="text-left py-3 px-4 text-sm text-hat-muted">Answer</th>
                    <th className="text-left py-3 px-4 text-sm text-hat-muted">Category</th>
                    <th className="text-left py-3 px-4 text-sm text-hat-muted">Difficulty</th>
                    <th className="text-left py-3 px-4 text-sm text-hat-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {puzzles.map((puzzle) => (
                    <tr key={puzzle._id} className="border-b border-hat-border/50 hover:bg-hat-dark/50">
                      <td className="py-3 px-4 text-sm">{puzzle.gameId}</td>
                      <td className="py-3 px-4 text-sm">
                        {(puzzle.data as any)?.payload?.prompt || JSON.stringify(puzzle.data)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{puzzle.answer}</td>
                      <td className="py-3 px-4 text-sm">{puzzle.categorySlug || "-"}</td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            puzzle.difficulty === "easy"
                              ? "bg-hat-emerald/20 text-hat-emerald"
                              : puzzle.difficulty === "medium"
                              ? "bg-hat-gold/20 text-hat-gold"
                              : "bg-hat-pink/20 text-hat-pink"
                          }`}
                        >
                          {puzzle.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingPuzzle(puzzle._id);
                              setShowCreateForm(false);
                            }}
                            className="text-hat-cyan hover:text-hat-cyan/80 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this puzzle?")) {
                                await deletePuzzle({ puzzleId: puzzle._id });
                              }
                            }}
                            className="text-hat-pink hover:text-hat-pink/80 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-hat-muted">
              No puzzles found. Create one to get started!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function PuzzleForm({
  gameId,
  categories,
  puzzleId,
  onClose,
  onCreate,
  onUpdate,
}: {
  gameId: string;
  categories: Array<{ _id: string; slug: string; label: string }>;
  puzzleId: Id<"puzzles"> | null;
  onClose: () => void;
  onCreate: (args: any) => Promise<any>;
  onUpdate: (args: any) => Promise<any>;
}) {
  const puzzle = useQuery(
    api.admin.getPuzzle,
    puzzleId ? { puzzleId } : "skip"
  );

  const [categorySlug, setCategorySlug] = useState<string>("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [prompt, setPrompt] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (puzzle && puzzleId) {
      setPrompt((puzzle.data as any)?.payload?.prompt || "");
      setAnswer(puzzle.answer);
      setDifficulty(puzzle.difficulty);
      setCategorySlug(puzzle.categorySlug || "");
    } else {
      // Reset form for new puzzle
      setPrompt("");
      setAnswer("");
      setDifficulty("easy");
      setCategorySlug("");
    }
  }, [puzzle, puzzleId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || !answer.trim()) return;

    setIsSubmitting(true);
    try {
      if (puzzleId) {
        await onUpdate({
          puzzleId,
          categorySlug: categorySlug || undefined,
          difficulty,
          data: {
            type: gameId === "mumbled" ? "mumbled" : gameId,
            payload: { prompt },
          },
          answer,
        });
      } else {
        await onCreate({
          gameId,
          categorySlug: categorySlug || undefined,
          difficulty,
          data: {
            type: gameId === "mumbled" ? "mumbled" : gameId,
            payload: { prompt },
          },
          answer,
        });
      }
      onClose();
      // Reset form
      setPrompt("");
      setAnswer("");
      setCategorySlug("");
      setDifficulty("easy");
    } catch (error) {
      console.error("Error saving puzzle:", error);
      alert("Failed to save puzzle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="game-card rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">
        {puzzleId ? "Edit Puzzle" : "Create New Puzzle"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-hat-muted mb-2">Prompt</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Sigh Cub Her Monday"
            className="w-full bg-hat-dark border border-hat-border rounded-lg px-4 py-2 text-hat-text focus:outline-none focus:border-hat-gold"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-hat-muted mb-2">Answer</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="e.g., Cyber Monday"
            className="w-full bg-hat-dark border border-hat-border rounded-lg px-4 py-2 text-hat-text focus:outline-none focus:border-hat-gold"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-hat-muted mb-2">Category</label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full bg-hat-dark border border-hat-border rounded-lg px-4 py-2 text-hat-text focus:outline-none focus:border-hat-gold"
            >
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-hat-muted mb-2">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full bg-hat-dark border border-hat-border rounded-lg px-4 py-2 text-hat-text focus:outline-none focus:border-hat-gold"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-glow px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : puzzleId ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-outline px-6 py-2 rounded-lg font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

