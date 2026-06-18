<p align="center">
  <img src="src/assets/banner.png" alt="SeaaveyBot" width="100%" />
</p>

<p align="center">
  <strong>Open Source WhatsApp Bot Framework</strong><br>
  Built with <a href="https://github.com/WhiskeySockets/Baileys">Baileys</a> and <a href="https://bun.sh">Bun</a>
</p>

<p align="center">
  <a href="https://github.com/seaavey/seaavey-bot/stargazers"><img src="https://img.shields.io/github/stars/seaavey/seaavey-bot?style=flat&color=yellow" alt="Stars" /></a>&nbsp;
  <a href="https://github.com/seaavey/seaavey-bot/network/members"><img src="https://img.shields.io/github/forks/seaavey/seaavey-bot?style=flat&color=blue" alt="Forks" /></a>&nbsp;
  <a href="https://github.com/seaavey/seaavey-bot/issues"><img src="https://img.shields.io/github/issues/seaavey/seaavey-bot?style=flat&color=red" alt="Issues" /></a>&nbsp;
  <a href="https://github.com/seaavey/seaavey-bot/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License" /></a>&nbsp;
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/runtime-Bun-f9f1e1?logo=bun" alt="Bun" /></a>
</p>

---

## Features

- 🔄 **Auto-reconnect** — Automatically reconnects on disconnect
- 📱 **QR & Pairing Code** — Login via QR code or pairing code
- ⚡ **Hot-reload** — Instant command reload in development mode
- 🧩 **Extensible** — Easy to add commands with auto-loading from filesystem
- 🛡️ **Middleware Pipeline** — Anti-link, anti-spam, anti-toxic, anti-viewonce, AFK, auto-reply, and game answer interception
- 📂 **13 Command Categories** — 150+ commands organized by category
- 🎮 **19 Games** — Trivia, TicTacToe, Hangman, Word Chain, and 16 word-guessing games with JSON data
- 💰 **Economy System** — Wallet, bank, daily rewards, shop, secure transfers
- 📊 **Leveling & XP** — Earn XP per command, level up with rank card images (Sharp canvas)
- 🤖 **AI Integration** — Google Gemini 2.5 Flash for image generation/editing
- 🌐 **HTTP API Server** — Elysia server (port 8080) with stats, users, groups, commands, logs, settings, schedules, and broadcast endpoints
- 🗳️ **Group Voting** — Polls and Votekick sessions with anti-double-vote
- ⚠️ **Warning System** — Per-group configurable max warns
- 📢 **AFK Status** — Auto-respond and clear status on activity
- 🖼️ **Media Conversion** — Image/Video to sticker, sticker to image, video/audio to MP3
- 📅 **Scheduler** — Reminders and scheduled messages with repeat support

## Requirements

- [Bun](https://bun.sh) v1.0+
- [FFmpeg](https://ffmpeg.org/)

## Installation

### Quick Start (VPS / Linux)

```bash
git clone https://github.com/seaavey/seaavey-bot.git
cd seaavey-bot
bash setup_vps.sh
```

### Quick Start (Termux / Android)

```bash
git clone https://github.com/seaavey/seaavey-bot.git
cd seaavey-bot
bash setup_termux.sh
```

### Manual Install

```bash
bun install
cp .env.example .env
# Edit .env with your OWNER_NUMBER
bun run start
```

Scan the QR code from `qr.png` or enter your phone number for pairing code.

---

## Architecture (Deep Dive)

### Project Structure

```
src/
├── index.ts                 # Entry point — connects WhatsApp, loads commands, starts server
├── core/
│   ├── config.ts            # Global config (prefix, owner, API keys)
│   ├── types.ts             # Command interface & defineCommand helper
│   └── logger.ts            # Pino logger (console + daily file)
├── commands/                # 13 categories, 150+ commands (auto-loaded)
│   ├── general/             # Menu, ping, runtime, profile, level, etc.
│   ├── converter/           # Encode, decode, toimg, tomp3
│   ├── downloader/          # YouTube, TikTok, Instagram, Spotify, etc.
│   ├── economy/             # Wallet, daily, shop, transfer
│   ├── fun/                 # Meme, quotes, ship, zodiak, waifu, etc.
│   ├── game/                # Trivia, TicTacToe, Hangman, Word Chain, etc.
│   ├── group/               # Admin tools, antilink, welcome, poll, etc.
│   ├── info/                # Weather, earthquake, GitHub, npm, etc.
│   ├── media/               # Sticker, QR, TTS, OCR, Carbon, etc.
│   ├── owner/               # Bot management commands
│   ├── productivity/        # Notes, todo, reminders, schedule, AFK
│   ├── search/              # Pinterest, SoundCloud, lyrics
│   └── tools/               # Calculator, translate, shortlink, tracking
├── handlers/
│   ├── message-handler.ts   # Incoming message processing
│   ├── command-dispatcher.ts# Command resolution & level-up detection
│   └── command-guards.ts    # Permission & cooldown checks
├── middleware/               # Pipeline executed per message
│   ├── anti-link.ts         # Auto-delete links when antilink enabled
│   ├── anti-spam.ts         # Rate-limit: 5 msgs / 10s
│   ├── anti-toxic.ts        # Built-in + custom toxic word filter
│   ├── anti-viewonce.ts     # Forwards view-once to owner
│   ├── afk.ts               # Auto-clears AFK on activity; notifies if mentioned
│   ├── auto-reply.ts        # SQLite-based keyword auto-replies
│   └── game-answer.ts       # Captures game answers from any text
├── services/
│   ├── command-service.ts   # List/find/enable-disable commands (for API)
│   └── group-service.ts     # List/get/update groups (for API)
├── game/
│   ├── game.ts              # Central game answer dispatcher (19 games)
│   └── word-game-factory.ts # Generic word-game command generator
├── canvas/
│   ├── rankCard.ts          # Sharp-based level rank card image
│   └── welcomeImage.ts      # Welcome + goodbye cards
├── utils/
│   ├── helper.ts            # Utilities (random, format, profile pics)
│   ├── convert.ts           # Sticker/img/mp3 conversion via ffmpeg
│   ├── ai.ts                # Google GenAI wrapper (gemini-2.5-flash)
│   └── group-toggle.ts      # Generic on/off toggle command factory
├── server/
│   ├── index.ts             # Elysia HTTP server (port 8080)
│   └── routes/              # 8 route modules
│       ├── stats.ts         # /api/stats
│       ├── users.ts         # /api/users
│       ├── groups.ts        # /api/groups
│       ├── commands.ts      # /api/commands
│       ├── logs.ts          # /api/logs
│       ├── settings.ts      # /api/settings
│       ├── schedules.ts     # /api/schedules
│       └── broadcast.ts     # /api/broadcast
└── infra/
    ├── loader.ts            # Auto-loads commands, hot-reload in dev
    ├── database.ts          # Database facade
    ├── scheduler.ts         # 30s-interval poller for reminders & schedules
    ├── db/client.ts         # bun:sqlite singleton (WAL mode)
    └── repositories/        # 9 SQLite data repositories
        ├── user-repo.ts     # users table (xp, level, banned)
        ├── economy-repo.ts  # economy table (wallet, bank, daily)
        ├── group-repo.ts    # groups + group_members
        ├── afk-repo.ts      # afk table
        ├── autoreply-repo.ts# autoreplies table
        ├── poll-repo.ts     # polls table
        ├── warn-repo.ts     # warns table
        ├── toxic-repo.ts    # toxic_words table
        └── schedule-repo.ts # reminders + schedules
```

### Middleware Pipeline

Every incoming message flows through this pipeline in order:

```
Message → Anti-ViewOnce → Anti-Link → Anti-Spam → Anti-Toxic → AFK → Game Answer → Auto-Reply
```

Each middleware can intercept, modify, or delete messages. The pipeline runs before the command dispatcher.

### Database

Built-in SQLite via `bun:sqlite` with WAL mode. 11 tables covering users, economy, groups, AFK, auto-replies, polls, warns, toxic words, reminders, and schedules. No external database setup required.

### HTTP API

An Elysia server runs on port `API_PORT` (default: 8080) providing:

| Endpoint         | Description                                         |
| ---------------- | --------------------------------------------------- |
| `/api/stats`     | Server stats, 7-day activity chart, recent activity |
| `/api/users`     | CRUD, ban/unban users                               |
| `/api/groups`    | List, update settings, mute/unmute                  |
| `/api/commands`  | List, enable/disable commands                       |
| `/api/logs`      | Tail recent log lines with level filter             |
| `/api/settings`  | Get/update bot settings                             |
| `/api/schedules` | CRUD for scheduled messages                         |
| `/api/broadcast` | Broadcast endpoint                                  |

### Game System

19 games including:

- **Standalone games:** Trivia, Math, Family100, Coinflip, Dice, Duel, Hangman, Quiz, Slot, Suit, TebakAngka, TicTacToe, Word Chain
- **Word games (16 JSON data files):** AsahOtak, CakLontong, SiapakahAku, SusunKata, TebakAnime, TebakBendera, TebakGambar, TebakKabupaten, TebakKalimat, TebakKimia, TebakLirik, TebakMemberJKT48, TebakTebakan, TebakWaifu, TekaTeki

All games feature 60s timeouts, hint systems, and XP rewards.

---

## Command Categories

| Category       | Description                                                                                |
| -------------- | ------------------------------------------------------------------------------------------ |
| `general`      | Menu, ping, runtime, profile, level, confess, etc.                                         |
| `tools`        | Calculator, translate, shortlink, tracking                                                 |
| `converter`    | Encode, decode, image-to-image, video-to-mp3                                               |
| `media`        | Sticker maker, QR code, TTS, OCR, Carbon, screenshot                                       |
| `downloader`   | YouTube, TikTok, Instagram, Facebook, Twitter/X, Spotify, SoundCloud, Pinterest, MediaFire |
| `fun`          | Meme, quotes, ship, zodiak, waifu, emojimix, fakta, etc.                                   |
| `game`         | Trivia, TicTacToe, Hangman, Word Chain, Duel, Slot, and 13+ word guessing games            |
| `economy`      | Wallet, daily, shop, transfer                                                              |
| `productivity` | Notes, todo, reminders, schedule, AFK                                                      |
| `group`        | Admin tools (kick, promote, demote), antilink, welcome, poll, votekick, warn, sider        |
| `info`         | Weather, earthquake, GitHub, npm packages, prayer times                                    |
| `search`       | Pinterest, SoundCloud, lyrics                                                              |
| `owner`        | Bot management (eval, broadcast, block, setprefix, etc.)                                   |

## Scripts

| Script                 | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `setup_vps.sh`         | Ubuntu/Debian installer — Bun, FFmpeg, PM2, dependencies |
| `setup_termux.sh`      | Termux/Android installer — Bun, dependencies             |
| `ecosystem.config.cjs` | PM2 process manager configuration                        |

### Development

```bash
bun run dev    # Runs with NODE_ENV=development (hot-reload enabled)
bun run start  # Production mode
bun run lint   # Biome check + TypeScript check
bun run format # Auto-format with Biome
```

## Adding Commands

Create a file in `src/commands/<category>/`:

```ts
// src/commands/general/hello.ts
import { defineCommand } from "@/types";

export default defineCommand({
  name: "hello",
  description: "Say hello",
  handler: async (_sock, msg) => {
    await msg.reply("Hello! 👋");
  },
});
```

Commands are auto-loaded on startup. In dev mode, changes are hot-reloaded.

## Docker

```bash
docker build -t seaaveybot .
docker run -v ./auth:/app/auth -v ./data:/app/data seaaveybot
```

## Configuration

| Variable         | Default       | Description                               |
| ---------------- | ------------- | ----------------------------------------- |
| `NODE_ENV`       | `production`  | `development` or `production`             |
| `OWNER_NUMBER`   | `62123456789` | Owner WhatsApp number(s), comma-separated |
| `API_KEY`        | —             | API key for api.seaavey.com               |
| `GEMINI_API_KEY` | —             | Google AI Studio API key (AI features)    |
| `API_PORT`       | `8080`        | HTTP API server port                      |

Bot prefix default: `.` (configurable at runtime via `setprefix` command)

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

[MIT](LICENSE) © Muhammad Adriansyah (Seaavey)

## Star History

<a href="https://www.star-history.com/#seaavey/seaavey-bot&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=seaavey/seaavey-bot&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=seaavey/seaavey-bot&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=seaavey/seaavey-bot&type=Date" />
 </picture>
</a>
