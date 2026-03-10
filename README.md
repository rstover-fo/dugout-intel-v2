# Dugout Intel

Real-time coaching intelligence for youth baseball. Track pitching, manage lineups, scout opponents, and get automated fatigue alerts — all from the dugout on game day.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Convex (real-time queries, mutations, 10-table schema) |
| Auth | Clerk (JWT templates, role-based access) |
| Offline | IndexedDB mutation queue with auto-replay |
| Tests | Vitest (21 specs for pure domain logic) |

## Architecture

```
Browser (Mobile)
    │ JWT Token
    ▼
Clerk Auth ── sign-in, session management
    │ Authenticated queries/mutations
    ▼
Convex Backend ── real-time subscriptions, 8 modules, 10 tables
    │ Offline fallback
    ▼
IndexedDB Queue ── per-function mutation queue, replays on reconnect
```

Every Convex function verifies team membership via auth helpers:

- **`assertTeamAccess`** — verifies caller is a team member, returns `{userId, role}`
- **`assertWriteAccess`** — blocks viewers from mutations
- **`assertOwnerAccess`** — owner-only operations (invites, destructive actions)
- **`assertDocBelongsToTeam`** — prevents cross-tenant document access

## Game Day UI

The live game view is a 7-tab interface optimized for quick dugout access:

| Tab | Purpose |
|-----|---------|
| **Pitching** | Pitch count, velocity tracking, fatigue alerts, FPS stats |
| **Lineup** | At-bat logging, batting order, outcome tracking |
| **Scouting** | Opponent player info, threat badges, approach notes |
| **Intel** | Pitcher vs batter matchups, tendencies |
| **Coach** | Quick alerts, auto messages, game export |
| **Feed** | Chronological game event log |
| **Manage** | Score, inning, game control |

## Domain Logic

All baseball calculations live in `src/lib/baseball.ts` — pure TypeScript functions with zero React or Convex imports:

- `calcPct`, `calcBattersFaced`, `calcFPS`, `calcFPSLast5`, `calcVeloStats`
- `evaluateAlerts` — pitch count thresholds, FPS drops, velocity decline, fatigue warnings
- `PITCHER_OUTCOMES`, `BATTER_OUTCOMES` — at-bat result type constants

## Database Schema

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `teams` | Team profiles | by_owner |
| `teamMembers` | Multi-user access (owner/coach/viewer) | by_team, by_user |
| `players` | Roster + scouted opponents | by_team, by_team_and_type, by_opponent |
| `playerSeasonStats` | Batting + pitching stats per season | by_player |
| `games` | Game records with status tracking | by_team, by_team_and_status |
| `pitcherAppearances` | Pitcher stints within a game | by_game |
| `pitchLogs` | Individual pitch data (strike/ball/velo) | by_appearance, by_game |
| `atBatResults` | Batter outcome tracking | by_game, by_player |
| `opponentPitcherLogs` | Tracking opposing pitchers | by_game |
| `pitchBudgets` | Weekend pitch budget management | by_team_and_weekend |

## Project Structure

```
convex/
  schema.ts              # 10-table schema definition
  helpers.ts             # Auth helpers (4 access control functions)
  auth.config.ts         # Clerk JWT → Convex auth bridge
  games.ts pitching.ts   # Game + pitching mutations/queries
  lineup.ts players.ts   # Batting + roster management
  teams.ts budgets.ts    # Team CRUD + pitch budgets
  seed.ts                # Demo data seeder

src/app/
  layout.tsx             # Root: ClerkProvider → ConvexProvider
  page.tsx               # Dashboard: team list + create
  team/[teamId]/
    page.tsx             # Team home: roster, staff, start game
    roster/page.tsx      # Roster management
    scouting/page.tsx    # Opponent scouting database
    game/
      new/page.tsx       # Pre-game setup (opponent, date)
      [gameId]/page.tsx  # Live game shell (7-tab UI)

src/components/
  game/                  # 7 tab components
  StatBox VeloChart ProgressBar OutcomeButtons
  ResultPills PlayerCard ThreatBadge
  ui/                    # shadcn/ui primitives

src/lib/
  baseball.ts            # Pure domain logic (21 tests)
  offline.ts             # IndexedDB mutation queue
  utils.ts               # cn() utility

src/hooks/
  useOfflineMutation.ts  # Offline-aware mutation hook
```

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/rstover-fo/dugout-intel-v2
cd dugout-intel-v2
npm install
```

### 2. Configure auth

1. Create a [Clerk](https://clerk.com) application
2. In Clerk dashboard: **Configure** → **JWT Templates** → create one named `convex`
3. Create `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

4. Run `npx convex dev` — it will prompt you to log in and create a project
5. In the [Convex dashboard](https://dashboard.convex.dev), set the environment variable:
   - `CLERK_JWT_ISSUER_DOMAIN` = `https://your-clerk-domain.clerk.accounts.dev`

### 3. Run (two terminals)

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js frontend
npm run dev
```

Open http://localhost:3000, sign in, and create your team.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server on :3000 |
| `npx convex dev` | Start Convex dev server (deploys schema + functions) |
| `npx vitest run` | Run 21 domain logic tests |
| `npm run build` | Production build (type-check + compile) |
| `npm run lint` | ESLint with next/core-web-vitals |
