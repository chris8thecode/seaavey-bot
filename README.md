<p align="center">
  <img src="assets/banner.png" alt="SeaaveyBot" width="100%" />
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
- ⚡ **Hot-reload** — Instant command reload in development
- 📂 **Category-based** — Organized command structure
- 🛡️ **Group Admin** — Full group management commands
- 🧩 **Extensible** — Easy to add new commands
- 🎛️ **Interactive Messages** — Buttons, lists, and more

## Requirements

- [Bun](https://bun.sh) v1.0+
- [FFmpeg](https://ffmpeg.org/)

## Installation

```bash
# Clone the repository
git clone https://github.com/seaavey/seaavey-bot.git
cd seaavey-bot

# Run installer (installs Bun, FFmpeg, dependencies)
bash bin/install.sh

# Or manual install
bun install
cp .env.example .env

# Start the bot
bun run start
```

Scan the QR code from `qr.png` or enter your phone number for pairing code.

## Scripts

| Script | Description |
|--------|-------------|
| `bin/install.sh` | Install Bun, FFmpeg, dependencies, setup .env |
| `bin/update.sh` | Pull latest changes & update dependencies |
| `bin/uninstall.sh` | Remove node_modules, auth, database, .env |
| `bin/create.sh` | Generate new command file interactively |

## Adding Commands

Create a file in `commands/<category>/`:

```ts
// commands/general/hello.ts
import { defineCommand } from "@/types";

export default defineCommand({
  name: "hello",
  description: "Say hello",
  handler: async (_sock, msg) => {
    await msg.reply("Hello! 👋");
  },
});
```

Or use the generator: `bash bin/create.sh`

Commands are auto-loaded on startup. In dev mode, changes are hot-reloaded.

## Command Categories

| Category | Description |
|----------|-------------|
| `general` | Menu, ping, runtime, etc. |
| `tools` | Sticker, OCR, TTS, QR, translate, etc. |
| `productivity` | Notes, todo, reminders, schedule, AFK |
| `downloader` | YouTube, TikTok, Instagram, etc. |
| `fun` | Meme, quotes, ship, zodiak, etc. |
| `game` | Trivia, tictactoe, hangman, etc. |
| `group` | Admin tools, antilink, welcome, etc. |
| `economy` | Wallet, daily, shop, transfer |
| `search` | Pinterest, SoundCloud, lyrics |
| `info` | Weather, GitHub, earthquake, etc. |
| `owner` | Bot management commands |

## Docker

```bash
docker build -t seaaveybot .
docker run -v ./auth:/app/auth seaaveybot
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | `development` or `production` |
| `OWNER_NUMBER` | - | Owner WhatsApp number(s), comma-separated |
| `API_KEY` | - | API key for external services |

Bot prefix default: `.` (configurable in `lib/config.ts`)

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

[MIT](LICENSE) © Muhammad Adriansyah (Seaavey)

## Star History

<a href="https://www.star-history.com/?repos=seaavey%2Fseaavey-bot&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=seaavey/seaavey-bot&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=seaavey/seaavey-bot&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=seaavey/seaavey-bot&type=date&legend=top-left" />
 </picture>
</a>
