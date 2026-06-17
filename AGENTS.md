# SeaaveyBot — Agent Guide

## Quick start

```bash
cp .env.example .env   # edit OWNER_NUMBER at minimum
bun install
bun run dev            # NODE_ENV=development (hot-reload commands)
bun run start          # production mode
```

## Commands

| Script           | What it does                                                     |
| ---------------- | ---------------------------------------------------------------- |
| `bun run dev`    | `NODE_ENV=development bun run src/index.ts` — hot-reload enabled |
| `bun run start`  | `bun run src/index.ts`                                           |
| `bun run lint`   | `biome check . && bun tsc` — **run this before committing**      |
| `bun run format` | `biome check --write .` — 2-space, 100-width                     |

CI runs `lint` + `bunx tsc --noEmit` on push/PR to `main`.

## Adding a command

Create `src/commands/<category>/<name>.ts` — auto-loaded at startup. Hot-reloaded in dev.

```ts
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "MyCommand",
  alias: ["trigger"],
  description: "What it does",
  // ownerOnly, groupOnly, adminOnly, botAdmin, cooldown (seconds), enabled
  handler: async (_sock, msg) => {
    await msg.reply("Hello!");
  },
});
```

Triggers are auto-collected from: `triggers[]`, `command`, `alias[]`, and the filename (without
`.ts`). Use the `args` property to get message arguments (already split by `" "`).

The `msg` parameter is a `MessageResolver` (see `src/utils/message-resolver.ts`). Key fields: `jid`,
`sender`, `body`, `isGroup`, `isAdmin`, `isOwner`, `args`, `quoted`, `reply()`, `send()`.

## Architecture

- **Entry**: `src/index.ts` — connects WhatsApp, loads commands
- **Message flow**: `resolveMessage()` → 7 middlewares (anti-viewonce → anti-link → anti-spam →
  anti-toxic → afk → game-answer → auto-reply) → `dispatchCommand()`
- **Database**: `bun:sqlite` WAL mode, single `data.db` file. Tables created lazily via
  `safeMigrate()` in each repository. No external DB needed.
- **AI**: Google Gemini 2.5 Flash via `@google/genai` (requires `GEMINI_API_KEY`)

## Key packages

| Package                | Purpose                             |
| ---------------------- | ----------------------------------- |
| baileys ^7.0.0-rc11    | WhatsApp Web protocol               |
| sharp ^0.34.5          | Rank card / welcome image rendering |
| @google/genai ^2.3.0   | Gemini AI                           |
| @biomejs/biome ^2.4.15 | Linter + formatter                  |

## TypeScript quirks

- ESM only (`"type": "module"`) — use `import type` for type-only imports (`verbatimModuleSyntax`)
- Path alias: `@/*` → `./src/*`
- `exactOptionalPropertyTypes: true` — be careful with optional fields
- `noUncheckedIndexedAccess: true` — array/dict access may return `undefined`
- `noUnusedLocals` / `noUnusedParameters` are **off** (never errors)
- `noExplicitAny` is **error** in Biome — use `unknown` instead

## Key conventions

- **No tests** — `*.test.*` is gitignored, no test framework installed
- Logger: `import { logger } from "@/core/logger"` — Pino with daily file + pretty console
- Database access: re-exported through `src/infra/database.ts` facade
- Group settings: accessed via `getGroup(jid)` from `src/infra/repositories/group-repo`
- Game data JSON files live in `src/data/games/`
- **No console.log** — Biome warns on `noConsole`. Use the logger instead.
- **No `any`** — Biome errors on `noExplicitAny`. Use `unknown` and narrow.
- Bot prefix defaults to `.` (configurable at runtime via `setprefix`)
- Owner numbers are comma-separated in `OWNER_NUMBER` env var

## Deployment

- PM2 config at `ecosystem.config.cjs`
- Docker: `docker build -t seaaveybot .` then mount `auth/` and `data/` volumes
- Must mount `./auth` (WhatsApp session) and `./data` (database) volumes in Docker
- FFmpeg required on host (for media conversion)
