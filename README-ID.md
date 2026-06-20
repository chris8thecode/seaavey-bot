<p align="center">
  <img src="src/assets/banner.png" alt="SeaaveyBot" width="100%" />
</p>

<p align="center">
  <strong>Framework Bot WhatsApp Open Source</strong><br>
  Dibangun dengan <a href="https://github.com/WhiskeySockets/Baileys">Baileys</a> dan <a href="https://bun.sh">Bun</a>
</p>

<p align="center">
  <a href="https://github.com/seaavey/seaavey-bot/stargazers"><img src="https://img.shields.io/github/stars/seaavey/seaavey-bot?style=flat&color=yellow" alt="Stars" /></a>&nbsp;
  <a href="https://github.com/seaavey/seaavey-bot/network/members"><img src="https://img.shields.io/github/forks/seaavey/seaavey-bot?style=flat&color=blue" alt="Forks" /></a>&nbsp;
  <a href="https://github.com/seaavey/seaavey-bot/issues"><img src="https://img.shields.io/github/issues/seaavey/seaavey-bot?style=flat&color=red" alt="Issues" /></a>&nbsp;
  <a href="https://github.com/seaavey/seaavey-bot/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License" /></a>&nbsp;
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/runtime-Bun-f9f1e1?logo=bun" alt="Bun" /></a>
</p>

---

<p align="center">
  <a href="README.md">English</a> | <strong>Bahasa Indonesia</strong>
</p>

---

## Fitur

- 🔄 **Auto-reconnect** — Otomatis menyambung ulang saat putus
- 📱 **QR & Pairing Code** — Login via kode QR atau pairing code
- ⚡ **Hot-reload** — Reload instan perintah di mode development
- 🧩 **Extensible** — Mudah menambah perintah dengan auto-loading dari filesystem
- 🛡️ **Middleware Pipeline** — Anti-link, anti-spam, anti-toxic, anti-viewonce, AFK, auto-reply, dan intersepsi jawaban game
- 📂 **13 Kategori Perintah** — 155+ perintah terorganisir per kategori
- 🎮 **19 Game** — Trivia, TicTacToe, Hangman, Word Chain, dan 16 game tebak kata dengan data JSON
- 💰 **Sistem Ekonomi** — Dompet, bank, reward harian, toko, transfer aman
- 📊 **Leveling & XP** — Dapatkan XP per perintah, naik level dengan kartu rank gambar (Sharp canvas)
- 🤖 **Integrasi AI** — Google Gemini 2.5 Flash untuk pembuatan/editing gambar
- 🗳️ **Voting Grup** — Poll dan Votekick dengan anti-vote ganda
- ⚠️ **Sistem Peringatan** — Max peringatan yang dapat dikonfigurasi per grup
- 📢 **Status AFK** — Auto-respons dan hapus status saat aktif
- 🖼️ **Konversi Media** — Gambar/Video ke stiker, stiker ke gambar, video/audio ke MP3
- 🅰️ **Scheduler** — Pengingat dan pesan terjadwal dengan dukungan pengulangan

## Persyaratan

- [Bun](https://bun.sh) v1.0+
- [FFmpeg](https://ffmpeg.org/)

## Instalasi

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

### Instalasi Manual

```bash
bun install
cp .env.example .env
# Edit .env dengan OWNER_NUMBER kamu
bun run start
```

Pindai kode QR dari `qr.png` atau masukkan nomor telepon untuk pairing code.

---

## Arsitektur (Deep Dive)

### Struktur Proyek

```
src/
├── index.ts                 # Titik masuk — menghubungkan WhatsApp, memuat perintah, memulai server
├── core/
│   ├── config.ts            # Konfigurasi global (prefix, owner, API keys)
│   ├── types.ts             # Interface Command & defineCommand helper
│   └── logger.ts            # Pino logger (console + file harian)
├── commands/                # 13 kategori, 155+ perintah (auto-loaded)
│   ├── general/             # Menu, ping, runtime, profile, level, dll.
│   ├── converter/           # Encode, decode, toimg, tomp3
│   ├── downloader/          # YouTube, TikTok, Instagram, Spotify, dll.
│   ├── economy/             # Dompet, daily, toko, transfer
│   ├── fun/                 # Meme, quotes, ship, zodiak, waifu, dll.
│   ├── game/                # Trivia, TicTacToe, Hangman, Word Chain, dll.
│   ├── group/               # Alat admin, antilink, welcome, poll, dll.
│   ├── info/                # Cuaca, gempa, GitHub, npm, dll.
│   ├── media/               # Stiker, QR, TTS, OCR, Carbon, dll.
│   ├── owner/               # Perintah manajemen bot
│   ├── productivity/        # Catatan, todo, pengingat, jadwal, AFK
│   ├── search/              # Pinterest, SoundCloud, lirik
│   └── tools/               # Kalkulator, translate, shortlink, pelacakan
├── handlers/
│   ├── message-handler.ts   # Pemrosesan pesan masuk
│   ├── command-dispatcher.ts# Resolusi perintah & deteksi level-up
│   └── command-guards.ts    # Pemeriksaan izin & cooldown
├── middleware/               # Pipeline yang dieksekusi per pesan
│   ├── anti-link.ts         # Hapus otomatis link saat antilink aktif
│   ├── anti-spam.ts         # Rate-limit: 5 pesan / 10 detik
│   ├── anti-toxic.ts        # Filter kata toksik bawaan + kustom
│   ├── anti-viewonce.ts     # Teruskan view-once ke owner
│   ├── afk.ts               # Hapus otomatis AFK saat aktif; beri tahu jika disebut
│   ├── auto-reply.ts        # Balasan otomatis berbasis keyword SQLite
│   └── game-answer.ts       # Tangkap jawaban game dari teks apa pun
├── services/
│   ├── command-service.ts   # Daftar/cari/aktif-nonaktifkan perintah (untuk API)
│   └── group-service.ts     # Daftar/ambil/perbarui grup (untuk API)
├── game/
│   ├── game.ts              # Dispatcher jawaban game pusat (19 game)
│   └── word-game-factory.ts # Generator perintah game tebak kata generik
├── canvas/
│   ├── rankCard.ts          # Kartu rank level berbasis Sharp
│   └── welcomeImage.ts      # Kartu selamat datang + selamat tinggal
├── utils/
│   ├── helper.ts            # Utilitas (random, format, profil pic)
│   ├── convert.ts           # Konversi stiker/img/mp3 via ffmpeg
│   ├── ai.ts                # Wrapper Google GenAI (gemini-2.5-flash)
│   └── group-toggle.ts      # Factory perintah toggle on/off generik
└── infra/
    ├── loader.ts            # Auto-load perintah, hot-reload di dev
    ├── database.ts          # Facade database
    ├── scheduler.ts         # Poller 30 detik untuk pengingat & jadwal
    ├── db/client.ts         # Singleton bun:sqlite (mode WAL)
    └── repositories/        # 9 repositori data SQLite
        ├── user-repo.ts     # Tabel users (xp, level, banned)
        ├── economy-repo.ts  # Tabel economy (dompet, bank, daily)
        ├── group-repo.ts    # groups + group_members
        ├── afk-repo.ts      # Tabel afk
        ├── autoreply-repo.ts# Tabel autoreplies
        ├── poll-repo.ts     # Tabel polls
        ├── warn-repo.ts     # Tabel warns
        ├── toxic-repo.ts    # Tabel toxic_words
        └── schedule-repo.ts # reminders + schedules
```

### Pipeline Middleware

Setiap pesan masuk mengalir melalui pipeline ini secara berurutan:

```
Pesan → Anti-ViewOnce → Anti-Link → Anti-Spam → Anti-Toxic → AFK → Game Answer → Auto-Reply
```

Setiap middleware dapat menyela, memodifikasi, atau menghapus pesan. Pipeline berjalan sebelum dispatcher perintah.

### Database

SQLite bawaan via `bun:sqlite` dengan mode WAL. 11 tabel mencakup users, economy, groups, AFK, auto-replies, polls, warns, toxic words, reminders, dan schedules. Tidak perlu pengaturan database eksternal.

### Sistem Game

19 game termasuk:

- **Game mandiri:** Trivia, Math, Family100, Coinflip, Dice, Duel, Hangman, Quiz, Slot, Suit, TebakAngka, TicTacToe, Word Chain
- **Game tebak kata (16 file data JSON):** AsahOtak, CakLontong, SiapakahAku, SusunKata, TebakAnime, TebakBendera, TebakGambar, TebakKabupaten, TebakKalimat, TebakKimia, TebakLirik, TebakMemberJKT48, TebakTebakan, TebakWaifu, TekaTeki

Semua game memiliki batas waktu 60 detik, sistem petunjuk, dan hadiah XP.

---

## Kategori Perintah

| Kategori       | Deskripsi                                                                         |
| -------------- | --------------------------------------------------------------------------------- |
| `general`      | Menu, ping, runtime, profile, level, confess, dll.                                |
| `tools`        | Kalkulator, translate, shortlink, pelacakan                                       |
| `converter`    | Encode, decode, gambar-ke-gambar, video-ke-mp3                                    |
| `media`        | Pembuat stiker, kode QR, TTS, OCR, Carbon, tangkapan layar                       |
| `downloader`   | YouTube, TikTok, Instagram, Facebook, Twitter/X, Spotify, SoundCloud, Pinterest, MediaFire |
| `fun`          | Meme, quotes, ship, zodiak, waifu, emojimix, fakta, dll.                         |
| `game`         | Trivia, TicTacToe, Hangman, Word Chain, Duel, Slot, dan 13+ game tebak kata      |
| `economy`      | Dompet, daily, toko, transfer                                                     |
| `productivity` | Catatan, todo, pengingat, jadwal, AFK                                             |
| `group`        | Alat admin (kick, promote, demote), antilink, welcome, poll, votekick, warn, sider |
| `info`         | Cuaca, gempa, GitHub, paket npm, jadwal sholat                                   |
| `search`       | Pinterest, SoundCloud, lirik                                                      |
| `owner`        | Manajemen bot (eval, broadcast, block, setprefix, dll.)                           |

## Skrip

| Skrip                 | Deskripsi                                                 |
| --------------------- | -------------------------------------------------------- |
| `setup_vps.sh`        | Installer Ubuntu/Debian — Bun, FFmpeg, PM2, dependensi   |
| `setup_termux.sh`     | Installer Termux/Android — Bun, dependensi               |
| `ecosystem.config.cjs`| Konfigurasi proses PM2                                   |

### Development

```bash
bun run dev       # Jalankan dengan NODE_ENV=development (hot-reload aktif)
bun run start     # Mode produksi
bun run lint      # ESLint + pengecekan TypeScript
bun run format    # Auto-format dengan Prettier
```

## Menambah Perintah

Buat file di `src/commands/<kategori>/`:

```ts
// src/commands/general/hello.ts
import { defineCommand } from "@/types";

export default defineCommand({
  name: "hello",
  description: "Ucapkan halo",
  handler: async (_sock, msg) => {
    await msg.reply("Halo! 👋");
  },
});
```

Perintah di-load otomatis saat startup. Di mode dev, perubahan di-hot-reload.

## Docker

```bash
docker build -t seaaveybot .
docker run -v ./auth:/app/auth -v ./data:/app/data seaaveybot
```

## Konfigurasi

| Variabel         | Default       | Deskripsi                                    |
| ---------------- | ------------- | -------------------------------------------- |
| `NODE_ENV`       | `production`  | `development` atau `production`              |
| `OWNER_NUMBER`   | `62123456789` | Nomor WhatsApp owner, dipisah koma           |
| `API_KEY`        | —             | API key untuk api.seaavey.com                |
| `GEMINI_API_KEY` | —             | API key Google AI Studio (fitur AI)          |

Prefix default bot: `.` (dapat dikonfigurasi saat runtime via perintah `setprefix`)

## Kontribusi

Kontribusi diterima! Jangan ragu untuk membuka issue atau mengirim pull request.

## Disclaimer

> **Hanya untuk Tujuan Edukasi & Pembelajaran**
>
> Proyek ini, termasuk semua scraper dan pengunduh media di `src/infra/scrapers/`, dibuat **hanya untuk tujuan edukasi dan pembelajaran** — untuk mempelajari teknik web scraping, pola integrasi API, dan konsep arsitektur perangkat lunak. **Bukan** untuk penggunaan komersial, distribusi, atau aktivitas apa pun yang melanggar Ketentuan Layanan pihak ketiga. Pengguna bertanggung jawab penuh untuk memastikan penggunaan kode ini mematuhi semua hukum dan kebijakan platform yang berlaku. Pengembang tidak bertanggung jawab atas penyalahgunaan apa pun.

## Lisensi

[MIT](LICENSE) © Muhammad Adriansyah (Seaavey)

## Star History

<a href="https://www.star-history.com/#seaavey/seaavey-bot&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=seaavey/seaavey-bot&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=seaavey/seaavey-bot&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=seaavey/seaavey-bot&type=Date" />
 </picture>
</a>
