# Owner Dashboard — Design Spec

## Overview

Web dashboard untuk owner SeaaveyBot yang mempermudah monitoring dan manajemen bot. Diakses via browser, jalan di localhost tanpa auth.

## Tech Stack

- **Backend:** Bun native HTTP server (jalan di proses yang sama dengan bot)
- **Frontend:** Nuxt (Vue), di-build ke static files dan di-serve oleh Bun
- **Database:** SQLite (existing) + tabel baru untuk logging
- **Port:** 3000 (configurable via env `DASHBOARD_PORT`)

## Architecture

```
SeaaveyBot/
├── src/
│   ├── index.ts              (entry, start bot + dashboard server)
│   └── dashboard/
│       ├── server.ts         (Bun HTTP server, serve API + static)
│       └── api/
│           ├── stats.ts      (GET /api/stats)
│           ├── users.ts      (GET /api/users, POST /api/users/:id/ban)
│           ├── groups.ts     (GET /api/groups, POST /api/groups/:id/leave, PATCH /api/groups/:id/features)
│           └── logs.ts       (GET /api/logs/commands, GET /api/logs/errors)
├── dashboard/                (Nuxt frontend app)
│   ├── nuxt.config.ts
│   ├── pages/
│   │   ├── index.vue         (monitoring & stats)
│   │   ├── users.vue         (user management)
│   │   ├── groups.vue        (group management)
│   │   └── logs.vue          (logs & activity)
│   └── components/
```

Bot dan dashboard server jalan dalam satu proses. Dashboard server akses data bot langsung dari memory dan SQLite.

## Pages & Features

### 1. Home — Monitoring & Stats
- Uptime bot
- Memory & CPU usage
- Jumlah grup aktif, total user, pesan hari ini
- Chart sederhana (pesan per jam dalam 24 jam terakhir)

### 2. User Management
- Tabel user: nama, nomor, status (banned/active), jumlah command used
- Aksi: ban, unban
- Search by nama/nomor
- Pagination

### 3. Group Management
- Tabel grup: nama, member count, fitur aktif
- Aksi: leave grup, toggle fitur (antilink, antispam, antitoxic, antidelete, antiviewonce, autosticker, autoreply)
- Search by nama grup
- Pagination

### 4. Logs & Activity
- Command usage log: user, command, group, timestamp
- Error log: message, stack, timestamp
- Filter by tanggal, user, command
- Pagination

## API Endpoints

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/api/stats` | GET | Uptime, memory, CPU, jumlah grup/user/pesan |
| `/api/users` | GET | List user (pagination, search) |
| `/api/users/:id/ban` | POST | Ban/unban user (toggle) |
| `/api/groups` | GET | List grup (pagination, search) |
| `/api/groups/:id/leave` | POST | Leave dari grup |
| `/api/groups/:id/features` | PATCH | Toggle fitur grup |
| `/api/logs/commands` | GET | Command log (filter: date, user, command) |
| `/api/logs/errors` | GET | Error log (filter: date) |

## Data Sources

- **Stats:** `process.uptime()`, `process.memoryUsage()`, in-memory counters (message count, dll)
- **Users & Groups:** SQLite database existing
- **Logs:** Tabel baru di SQLite:
  - `command_logs` (id, user_jid, command, group_jid, timestamp)
  - `error_logs` (id, message, stack, timestamp)

## Logging Strategy

Tambah logger di message handler:
- Setiap command yang berhasil dieksekusi → insert ke `command_logs`
- Setiap unhandled error → insert ke `error_logs`

## Constraints

- Localhost only, tanpa authentication
- Satu proses dengan bot (tidak perlu IPC)
- Dashboard port configurable via env `DASHBOARD_PORT` (default 3000)
- Nuxt di-build ke static, tidak perlu SSR
