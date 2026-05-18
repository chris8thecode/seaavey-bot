# Src Structure Migration (No lib) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `src/lib` and migrate files into domain folders under `src` with zero behavior change.

**Architecture:** Keep existing module boundaries but relocate files to `src/core`, `src/handlers`, `src/game`, `src/infra`, `src/utils`, `src/types`. Preserve alias-based imports by switching `@/*` mapping to `./src/*`, then update import targets to new foldered paths.

**Tech Stack:** Bun, TypeScript (`moduleResolution: bundler`), Biome lint.

---

## File Structure Map

- `src/core/config.ts` — runtime config + env flags.
- `src/core/types.ts` — shared command/message types.
- `src/core/logger.ts` — logger instance.
- `src/handlers/message-handler.ts` — incoming message pipeline.
- `src/handlers/group-handler.ts` — participant update pipeline.
- `src/handlers/interactive.ts` — interactive message helpers.
- `src/game/game.ts` — game state/answer checks.
- `src/game/game-helper.ts` — reusable `GameManager`.
- `src/infra/database.ts` — sqlite access + bot persistence helpers.
- `src/infra/api.ts` — HTTP client wrapper for external APIs.
- `src/infra/loader.ts` — command discovery/registration.
- `src/infra/scheduler.ts` — reminder scheduler startup/execution.
- `src/utils/helper.ts` — shared utility helpers.
- `src/utils/convert.ts` — sticker/media conversion helpers.
- `src/types/node-webpmux.d.ts` — ambient typing for `node-webpmux`.
- `tsconfig.json` — alias update from `./src/lib/*` to `./src/*`.

### Task 1: Create destination folders and move files

**Files:**
- Modify: `src/lib/*` (moved)
- Create: `src/core/`, `src/handlers/`, `src/game/`, `src/infra/`, `src/utils/`, `src/types/`

- [ ] **Step 1: Snapshot baseline lint (pre-migration)**

Run: `bun run lint`
Expected: PASS on current `main` baseline.

- [ ] **Step 2: Create destination folders**

Run:
```bash
mkdir -p src/core src/handlers src/game src/infra src/utils src/types
```
Expected: folders created.

- [ ] **Step 3: Move files with git tracking**

Run:
```bash
git mv src/lib/config.ts src/core/config.ts && git mv src/lib/types.ts src/core/types.ts && git mv src/lib/logger.ts src/core/logger.ts && git mv src/lib/message-handler.ts src/handlers/message-handler.ts && git mv src/lib/group-handler.ts src/handlers/group-handler.ts && git mv src/lib/interactive.ts src/handlers/interactive.ts && git mv src/lib/game.ts src/game/game.ts && git mv src/lib/game-helper.ts src/game/game-helper.ts && git mv src/lib/database.ts src/infra/database.ts && git mv src/lib/api.ts src/infra/api.ts && git mv src/lib/loader.ts src/infra/loader.ts && git mv src/lib/scheduler.ts src/infra/scheduler.ts && git mv src/lib/helper.ts src/utils/helper.ts && git mv src/lib/convert.ts src/utils/convert.ts && git mv src/lib/node-webpmux.d.ts src/types/node-webpmux.d.ts
```
Expected: all listed paths appear as `renamed:` in `git status`.

- [ ] **Step 4: Remove empty legacy directory**

Run:
```bash
rmdir src/lib
```
Expected: command succeeds (directory empty).

- [ ] **Step 5: Commit move-only change**

Run:
```bash
git add src/core src/handlers src/game src/infra src/utils src/types && git commit -m "refactor(src): move lib modules into domain folders"
```
Expected: commit created with rename-heavy diff.

### Task 2: Update alias config and import paths

**Files:**
- Modify: `tsconfig.json`
- Modify: `src/**/*.ts` (imports targeting migrated files)

- [ ] **Step 1: Update `@/*` alias root**

Edit `tsconfig.json` to:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@canvas/*": ["./src/canvas/*"]
    }
  }
}
```
Expected: `@/x` resolves to `src/x`.

- [ ] **Step 2: Replace imports to new foldered targets**

Run:
```bash
perl -pi -e 's@"@/config"@"@/core/config"@g; s@"@/types"@"@/core/types"@g; s@"@/logger"@"@/core/logger"@g; s@"@/message-handler"@"@/handlers/message-handler"@g; s@"@/group-handler"@"@/handlers/group-handler"@g; s@"@/interactive"@"@/handlers/interactive"@g; s@"@/game"@"@/game/game"@g; s@"@/game-helper"@"@/game/game-helper"@g; s@"@/database"@"@/infra/database"@g; s@"@/api"@"@/infra/api"@g; s@"@/loader"@"@/infra/loader"@g; s@"@/scheduler"@"@/infra/scheduler"@g; s@"@/helper"@"@/utils/helper"@g; s@"@/convert"@"@/utils/convert"@g; s@"@/lib/game-helper"@"@/game/game-helper"@g' $(find src -type f -name '*.ts')
```
Expected: imports rewritten across source files.

- [ ] **Step 3: Verify no old `lib` imports remain**

Run:
```bash
grep -R --line-number --include='*.ts' '@/lib/' src || true
```
Expected: no matches.

- [ ] **Step 4: Verify all top-level old aliases are gone**

Run:
```bash
grep -R --line-number --include='*.ts' 'from "@/[a-z-]*"' src || true
```
Expected: either no matches, or matches are intended paths with subfolders (manually inspect).

- [ ] **Step 5: Commit import + config migration**

Run:
```bash
git add tsconfig.json src && git commit -m "refactor(src): update aliases and imports for new module layout"
```
Expected: commit created with import-path edits.

### Task 3: Verify migration end-to-end

**Files:**
- Modify: none (verification only)

- [ ] **Step 1: Run lint after migration**

Run: `bun run lint`
Expected: PASS.

- [ ] **Step 2: Optional runtime smoke check**

Run: `bun run dev`
Expected: bot starts without import/module-resolution error (stop manually after startup log).

- [ ] **Step 3: Verify working tree clean except expected commits**

Run: `git status --short`
Expected: empty output.

- [ ] **Step 4: Final summary check**

Run:
```bash
find src -maxdepth 2 -type d | grep -E '^src/(core|handlers|game|infra|utils|types)$' && test ! -d src/lib && echo 'layout ok'
```
Expected: all new folders listed, then `layout ok`.

- [ ] **Step 5: If verification fixes were needed, commit them**

Run:
```bash
git add -A && git commit -m "fix(src): resolve migration verification issues"
```
Expected: commit only if post-verification fixes exist.

## Self-Review

- **Spec coverage:** All spec targets mapped (folder layout, import updates, no logic refactor, lint verification).
- **Placeholder scan:** No TODO/TBD placeholders.
- **Type consistency:** Import targets and alias strategy consistent with destination paths.
