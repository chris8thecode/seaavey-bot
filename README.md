<p align="center">
  <img src="src/assets/banner.png" alt="SeaaveyBot" width="100%" />
</p>

<p align="center">
  <strong>WhatsApp Bot Framework</strong><br>
  Built with <a href="https://github.com/WhiskeySockets/Baileys">Baileys</a> + <a href="https://bun.sh">Bun</a>
</p>

<p align="center">
  <a href="https://github.com/seaavey/seaavey-bot/stargazers"><img src="https://img.shields.io/github/stars/seaavey/seaavey-bot?style=flat&color=yellow" alt="Stars" /></a>
  <a href="https://github.com/seaavey/seaavey-bot/network/members"><img src="https://img.shields.io/github/forks/seaavey/seaavey-bot?style=flat&color=blue" alt="Forks" /></a>
  <a href="https://github.com/seaavey/seaavey-bot/issues"><img src="https://img.shields.io/github/issues/seaavey/seaavey-bot?style=flat&color=red" alt="Issues" /></a>
  <a href="https://github.com/seaavey/seaavey-bot/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License" /></a>
</p>

---

**English** | [Bahasa Indonesia](README-ID.md)

---

## Features

- **155+ commands** across 13 categories — downloaders, games, economy, group management, media tools, and more
- **19 games** — trivia, TicTacToe, Hangman, Word Chain, and 15+ word-guessing games
- **Economy system** — wallet, bank, daily rewards, shop, transfers
- **Leveling & XP** — earn XP per command, level up with rank cards (Sharp canvas)
- **Middleware pipeline** — anti-link, anti-spam, anti-toxic, anti-viewonce, AFK, auto-reply, game answer interception
- **Auto-reconnect** — handles disconnects seamlessly
- **Hot-reload** — instant command reload in development mode

## Quick Start

```bash
git clone https://github.com/seaavey/seaavey-bot.git
cd seaavey-bot
cp .env.example .env   # edit OWNER_NUMBER
bun install
bun run start          # scan QR or enter pairing code
```

## Requirements

- [Bun](https://bun.sh) v1.0+
- [FFmpeg](https://ffmpeg.org/)

## Scripts

| Command              | Description                            |
| -------------------- | -------------------------------------- |
| `bun run dev`        | Development mode with hot-reload       |
| `bun run start`      | Production mode                        |
| `bun run lint`       | ESLint + TypeScript check              |
| `bun run format`     | Prettier auto-format                   |

## Project Structure

```
src/
├── index.ts           # Entry point
├── commands/          # 155+ commands (13 categories)
├── handlers/          # Message processing & command dispatch
├── middleware/        # Anti-link, anti-spam, etc.
├── game/              # Game engine (19 games)
├── core/              # Config, types, logger
├── canvas/            # Rank cards, welcome images
├── services/          # API service layer
├── infra/             # Database, scrapers, scheduler
└── utils/             # Helpers, converters, AI wrapper
```

See [AGENTS.md](AGENTS.md) for full command catalog and architecture details.

## Docker

```bash
docker build -t seaaveybot .
docker run -v ./auth:/app/auth -v ./data:/app/data seaaveybot
```

## Contributing

Open an issue or submit a pull request.

## License

[MIT](LICENSE) © Muhammad Adriansyah (Seaavey)
