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

## Installation

```bash
# Clone the repository
git clone https://github.com/seaavey/seaavey-bot.git
cd seaavey-bot

# Install dependencies
bun install

# Copy environment config
cp .env.example .env

# Start the bot
bun run index.ts
```

Scan the QR code from `qr.png` or enter your phone number for pairing code.

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

Commands are auto-loaded on startup. In dev mode, changes are hot-reloaded.

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
