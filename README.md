<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,100:161b22&height=200&section=header&text=SeaaveyBot&fontSize=50&fontColor=ffffff&animation=fadeIn" />
</p>

WhatsApp bot built with [Baileys](https://github.com/WhiskeySockets/Baileys) and [Bun](https://bun.sh).

## Features

- Auto-reconnect on disconnect
- QR code login (saved to `qr.png`)
- Hot-reload commands in dev mode
- Category-based command loader

## Requirements

- [Bun](https://bun.sh) v1+

## Setup

```bash
bun install
bun run index.ts
```

Scan the QR code from `qr.png` with your WhatsApp app.

## Docker

```bash
docker build -t seaaveybot .
docker run -v ./auth:/app/auth seaaveybot
```

## Adding Commands

Create a file in `commands/<category>/`:

```ts
// commands/general/ping.ts
import { defineCommand } from "@/types";

export default defineCommand({
  name: "ping",
  description: "Check bot latency",
  handler: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid!, { text: "Pong!" });
  },
});
```

Commands are auto-loaded on startup. In dev mode, changes are hot-reloaded.

## Config

| Key | Default | Description |
|-----|---------|-------------|
| `prefix` | `!` | Command prefix |
| `OWNER_NUMBER` | - | Owner number (env var) |

## License

[MIT](LICENSE) © Muhammad Adriansyah (Seaavey)
