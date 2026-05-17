# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
SeaaveyBot is an open-source WhatsApp Bot Framework built with [Baileys](https://github.com/WhiskeySockets/Baileys) and [Bun](https://bun.sh).

## Key Development Commands
- **Start:** `bun run start` (production) or `bun run dev` (development with hot-reload).
- **Lint/Format:** `bun run lint` or `bun run format`.
- **Add Command:** Use `bash bin/create.sh` to generate a command template in `commands/<category>/`.
- **Install/Update/Uninstall:** Use the helper scripts in `bin/`: `install.sh`, `update.sh`, `uninstall.sh`.

## Architecture
- **Runtime:** Bun.
- **Entry Point:** `src/index.ts`.
- **Command Structure:** Commands are categorized in `commands/`. A command file exports a `defineCommand` object containing its name, description, and handler. These are auto-loaded on startup.
- **Data:** Uses a local SQLite database (`data.db`) managed via Baileys and local storage.
- **Authentication:** WhatsApp session data is stored in the `auth/` directory.

## Development Notes
- Commands are auto-loaded on startup; hot-reload is enabled in development mode.
- Configuration is handled via environment variables (e.g., `OWNER_NUMBER`, `API_KEY`). Check `lib/config.ts` for defaults and structure.
