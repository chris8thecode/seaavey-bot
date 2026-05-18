# Src Structure Design (No `lib`)

## Goal
Rapihkan struktur `src` dengan menghapus `src/lib` dan mengelompokkan file berdasar domain, tanpa mengubah logic.

## Target Structure
- `src/core/`
  - `config.ts`
  - `types.ts`
  - `logger.ts`
- `src/handlers/`
  - `message-handler.ts`
  - `group-handler.ts`
  - `interactive.ts`
- `src/game/`
  - `game.ts`
  - `game-helper.ts`
- `src/infra/`
  - `database.ts`
  - `api.ts`
  - `loader.ts`
  - `scheduler.ts`
- `src/utils/`
  - `helper.ts`
  - `convert.ts`
- `src/types/`
  - `node-webpmux.d.ts`

## Rules
1. Hanya pindah file + update import path.
2. Tidak ada perubahan behavior/logic.
3. Naming file tetap sama untuk minim risiko.

## Data Flow / Dependency Direction
- `handlers` boleh depend ke `core`, `game`, `infra`, `utils`.
- `game` boleh depend ke `core`, `utils`.
- `infra` boleh depend ke `core`.
- `core` tidak depend ke domain lain.

## Error Handling
Tidak menambah error handling baru. Kompilasi/lint error akibat path diperlakukan sebagai bug migrasi import dan harus diperbaiki.

## Verification
1. `bun run lint`
2. (opsional) `bun run dev` untuk smoke start

## Out of Scope
- Rename API/fungsi.
- Refactor logic internal.
- Menambah fitur baru.
