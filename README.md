````markdown
# 🎩 ThinkingHat Games

**ThinkingHat** (or **ThinkingHat Games**) is a cross-platform party game platform and monorepo.

It’s built to make it *easy* to create and host Jackbox-style games that run on:

- 📱 **Mobile** – Expo (React Native)
- 🖥️ **Web** – Next.js
- ☁️ **Backend** – Convex (realtime DB + functions)
- 🔐 **Auth** – Clerk
- 🤖 **AI** – OpenAI

ThinkingHat launches with **three core games** built on the same shared framework:

- **Mumbled** – sound-alike nonsense phrases
- **Rebus** – visual/layout word puzzles
- **Riddles** – short cryptic clues

All games use the same **room system**, **player modes**, and **game engine wrappers**, so adding new games is straightforward.

---

## 🎯 Project Goals

- Build a **reusable game platform** where:
  - Every game supports **single player**, **two player**, and **party** modes.
  - Every game can be played in **online** or **local** mode.
- Keep the **core framework generic and composable**:
  - Shared room/session handling, player management, and realtime sync.
  - Games plug into a common wrapper with minimal custom logic.
- Use **Convex** for realtime state and **Clerk** for low-friction auth.
- Make it easy to:
  - Add new **games**
  - Add new **answer categories**
  - Add new **puzzle/game types** without major rewrites.
- Provide **interactive tutorials** so each game is easy to learn.

---

## 💻 Tech Stack

- **Monorepo**: Turborepo
- **Backend**: [Convex](https://convex.dev) (database + realtime queries + functions)
- **Auth**: [Clerk](https://clerk.com)
- **AI**: [OpenAI API](https://platform.openai.com)
- **Web App**: [Next.js](https://nextjs.org)
- **Mobile App**: [Expo](https://expo.dev) (React Native)
- **Language**: TypeScript everywhere

---

## 🗂 Monorepo Structure (Planned)

> This is a working structure and may evolve.

```txt
thinkinghat/
├─ apps/
│  ├─ web/           # Next.js web app (host UI, browser players)
│  ├─ mobile/        # Expo React Native app
│  └─ convex/        # Convex backend: schema, queries, mutations, actions
│
├─ packages/
│  ├─ ui/            # Shared UI components and design tokens (buttons, layout, overlays, etc.)
│  ├─ game-core/     # Shared game framework types, hooks, and logic
│  ├─ config/        # Shared eslint/prettier/tsconfig/turbo config
│  └─ utils/         # Shared helpers and hooks
│
└─ turbo.json        # Turborepo configuration
````

---

## 🧩 Platform Concepts

### Game

A **Game** is a top-level experience on ThinkingHat (e.g. **Mumbled**, **Rebus**, **Riddles**, future games, etc.).

Each game defines:

* `id` – unique identifier (e.g. `"mumbled"`, `"rebus"`, `"riddles"`)
* `name` – display name
* Supported **player modes**:

  * `single` | `two-player` | `party`
* Supported **play types**:

  * `online` | `local`
* Config options:

  * Available **answer categories** (e.g. Common Phrases, Movie Titles, Common Objects)
  * Game-specific puzzle structures (e.g. sound-alike strings vs layout vs riddle text)
* Game-specific UI components & Convex logic
* An **interactive tutorial** that teaches how to play *that* game

> **Design note:** categories and puzzle types should be defined dynamically (config/DB), not hardcoded. It should be possible to add new categories (e.g. Song Lyrics) or even new game types that reuse the same engine.

---

### Player Modes

All games share the same high-level player modes:

* **Single Player**

  * One user playing solo, progressing through puzzles.
* **Two Player**

  * Head-to-head mode; shared or separate devices.
* **Party Mode**

  * 3+ players (ideal for groups in the same physical room).

The game wrapper (shared in `packages/game-core` / `packages/ui`) handles:

* Lobby & player joining
* Ready states / starting the game
* Turn order or simultaneous play, as needed per game

---

### Play Types: Online vs Local

All games support:

* **Online**

  * Each player joins from their own device (web or mobile).
  * State is synchronized via Convex.
* **Local**

  * Everyone is in the **same physical room** but on **different devices**.
  * One device typically acts as a “host screen” (e.g. TV / laptop).
  * Other devices join via **room code** and act as controllers.

> Local ≠ single-device pass-and-play. Local assumes multiple devices in the same room.

---

### Rooms & Room Codes

* Every session is represented as a **Room**.
* Each room:

  * Has a unique **room code** (e.g. 4–6 characters).
  * Stores: game ID, mode, config, and current state.
  * Tracks joined players, their roles (host/player/spectator), and connection status.
* Players join rooms by:

  * Entering the room code
  * Or clicking a shareable join link (deep links for mobile/web)

The **room system is shared by all games**, so new games can reuse it with no extra infrastructure.

---

### Tutorials

Each game has its own **interactive tutorial** that:

* Demonstrates:

  * How the clues work
  * How to submit answers
  * How scoring / turns operate
* Includes at least one example puzzle from that game.
* Is accessible:

  * From the main game selection list (e.g. “Learn how to play”)
  * From inside each game (e.g. a help menu)

---

### Reconnection & Error Handling

The platform aims for **robust reconnection**:

* Clients:

  * Store recent `roomCode` and `playerId` locally.
  * Attempt to rejoin on refresh or app restart.
* Convex:

  * Tracks connection status per player (e.g. via heartbeats or presence).
  * Allows rejoin to the same room when the player returns.
* UX:

  * Clear messages for:

    * Room not found
    * Room full
    * Game already finished
  * Actions like:

    * “Rejoin last room”
    * “Return to lobby”
    * “Create new room”

---

## 🎮 Launch Games

ThinkingHat launches with **three separate games**, all benefiting from the same room system, shared engine wrapper, and UI scaffolding.

### 1️⃣ Mumbled

**Mumbled** is a sound-alike puzzle game.

* Players see nonsense syllables that *sound like* real phrases when spoken quickly.
* Example:

  * `Sigh Cub Her Monday` → **“Cyber Monday”**
* Clues are purely textual; the challenge is phonetic.

**Config / Features:**

* Categories (dynamic):

  * Common Phrases
  * Movie Titles
  * Common Objects
* Difficulty levels:

  * Easy / Medium / Hard
* Player modes:

  * Single / Two Player / Party
* Online & Local support:

  * Room codes, shared host view, controller devices
* Interactive tutorial:

  * At least one phonetic example + practice round.

---

### 2️⃣ Rebus

**Rebus** is a visual/layout-based puzzle game.

* Players see words, symbols, or text arranged visually to imply a phrase.
* Example:

  * `jobINjob` → **“In between jobs”**
* Clues rely on:

  * Position
  * Repetition
  * Formatting / spacing

**Config / Features:**

* Categories (dynamic):

  * Common Phrases
  * Movie Titles
  * Common Objects
* Difficulty levels:

  * Easy / Medium / Hard
* Player modes:

  * Single / Two Player / Party
* Online & Local support:

  * Host “board” view + player controllers
* Interactive tutorial:

  * Explains common rebus patterns with a guided example.

---

### 3️⃣ Riddles

**Riddles** is a cryptic/riddle-style puzzle game.

* Players see a short clue or riddle that points to a phrase or object.
* Example:

  * “I’m floating right behind” → **“Rafter”**
* Clues may use:

  * Wordplay
  * Double meanings
  * Light cryptic or lateral thinking

**Config / Features:**

* Categories (dynamic):

  * Common Phrases
  * Movie Titles
  * Common Objects
* Difficulty levels:

  * Easy / Medium / Hard
* Player modes:

  * Single / Two Player / Party
* Online & Local support
* Interactive tutorial:

  * Shows typical riddle patterns and a practice puzzle.

---

## 🌟 Creative Mode (Cross-Game Creator)

After a user:

* Solves **10 Hard** puzzles (across any combination of Mumbled, Rebus, and Riddles),

they unlock a **cross-game Creative Mode** (e.g. **ThinkingHat Creator**).

### Creative Mode Features

* ✏️ **Create puzzles** for any of the three games:

  * Specify:

    * Game: Mumbled / Rebus / Riddles
    * Category (dynamic)
    * Difficulty (Easy / Medium / Hard)
    * Puzzle content (text, layout descriptor, riddle text, etc.)
    * Answer
* ⭐ **Rate puzzles (1–5)**

  * Players rate user-generated puzzles.
  * Stored as:

    * `ratingSum`, `ratingCount` → average rating
* 🚩 **Flag puzzles**

  * Flag as “broken”, “offensive”, or “too obscure”.
  * Flagged puzzles:

    * Are not shown in normal rotation.
    * Can be filtered out by queries.

Optionally, OpenAI can assist with:

* Difficulty suggestion
* Category suggestion
* Content moderation

---

## 🧮 Puzzles & Data Model (Convex)

All puzzles live in Convex tables and are **shared across games** by tagging them appropriately.

### Puzzles Table (Concept)

A `puzzles` table might include:

* `id`
* `gameId` – `"mumbled" | "rebus" | "riddles" | ..."`
* `categoryId` – or category string (dynamic categories)
* `difficulty` – `"easy" | "medium" | "hard"`
* `data` – structured payload varying by game:

  * Mumbled: `nonsenseText`, optional phonetic hints
  * Rebus: layout description / tokens
  * Riddles: `riddleText`
* `answer`
* `isUserGenerated` – boolean
* `createdByUserId` – nullable
* `ratingCount`, `ratingSum`
* `flagCount`

### Puzzle Stats

Per-puzzle stats:

* `attempts` – number of times the puzzle was started
* `completions` – number of times the puzzle was solved
* Optional:

  * `avgTimeToSolve`
  * `hintUsedCount`
  * game-specific stats

These stats support:

* Leaderboards
* “Most played” / “Hidden gem” surfacing
* Future adaptive difficulty

### Seeding

Puzzles can be **seeded** via:

* `.json` or `.jsonl` files
* Scripts under `apps/convex` (e.g. `seed-puzzles.ts`)

This allows:

* Version-controlled puzzle content
* Easy batch importing
* Evolving categories and games over time

---

## 🏆 Player Stats & Leaderboards

ThinkingHat tracks per-user stats in Convex, including:

* Total puzzles solved by difficulty:

  * Easy / Medium / Hard
* Per-game stats (Mumbled, Rebus, Riddles separately)
* Unlocks (e.g. access to Creative Mode)

Leaderboards can be:

* Global – top solvers overall
* Per-game – best players in Mumbled, Rebus, or Riddles
* By difficulty – e.g. “Most Hard puzzles solved”

---

## 🔐 Auth & Identity (Clerk)

* Users log in with:

  * Google
  * Apple
  * Other providers supported by Clerk
* Login is **super simple**:

  * Ideal: one-tap OAuth
  * Minimal friction before reaching game list

Both web and mobile share the same Clerk identity:

* Progress and stats sync across devices.
* Users can start a game on one device and later play on another.

---

## 🤖 AI Integration (OpenAI)

OpenAI is used for:

* Assisting puzzle generation (internal tools or future content pipelines)
* Suggesting difficulty and/or category for user-generated puzzles
* Providing optional hints
* Screening user-generated content (moderation)

Shared AI helpers should live in `packages/utils` or `packages/game-core` to keep concerns centralized.

---

## 🚀 Getting Started (Dev)

### Prerequisites

* Node.js (LTS, e.g. 20+)
* pnpm or yarn
* Convex CLI
* Expo CLI
* Accounts & keys for:

  * Convex
  * Clerk
  * OpenAI

### 1. Clone the repo

```bash
git clone https://github.com/your-org/thinkinghat-games.git
cd thinkinghat-games
```

### 2. Install dependencies

```bash
pnpm install
# or
yarn install
```

### 3. Environment variables

Create `.env` / `.env.local` in relevant apps.

You’ll typically need:

* **Convex**

  * `CONVEX_DEPLOYMENT`
  * `CONVEX_AUTH_URL` (for Clerk integration)
* **Clerk**

  * `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  * `CLERK_SECRET_KEY`
  * Expo-specific keys (e.g. `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`)
* **OpenAI**

  * `OPENAI_API_KEY`

### 4. Run dev servers

Convex backend:

```bash
cd apps/convex
npx convex dev
```

Web (Next.js):

```bash
pnpm dev:web
# or
pnpm turbo run dev --filter=web
```

Mobile (Expo):

```bash
pnpm dev:mobile
# or
pnpm turbo run dev --filter=mobile
```

---

## 📈 Roadmap / Future Ideas

* Additional games built on the same wrapper (e.g. Emoji puzzles, Anagrams, Trivia, Cryptic Crossword).
* Friend lists and private lobbies.
* “TV/Host mode” layouts optimized for large screens.
* More advanced analytics dashboards.
* Offline support / caching.
* Weighted puzzle selection based on stats and ratings.
* Admin backend
* Monetized
* ELO online rating


