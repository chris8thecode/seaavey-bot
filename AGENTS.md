# SeaaveyBot — Agent Guide

## Quick start

```bash
cp .env.example .env   # edit OWNER_NUMBER at minimum
bun install
bun run dev            # NODE_ENV=development (hot-reload commands)
bun run start          # production mode
```

### Environment variables

| Variable       | Required | Description                                   |
| -------------- | -------- | --------------------------------------------- |
| `OWNER_NUMBER` | Yes      | Owner WhatsApp number(s), comma-separated     |
| `NODE_ENV`     | No       | `development` or `production` (default: prod) |

## Commands

| Script                 | What it does                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| `bun run dev`          | `NODE_ENV=development bun run src/index.ts` — hot-reload enabled |
| `bun run start`        | `bun run src/index.ts`                                           |
| `bun run lint`         | `eslint . && bun tsc` — **run this before committing**           |
| `bun run format`       | `prettier --write .` — 2-space, 100-width                        |
| `bun run format:check` | `prettier --check .` — verify formatting                         |

CI runs `lint` + `bunx tsc --noEmit` on push/PR to `main`.

## Project structure

```
src/
├── index.ts                  # Entry point — WhatsApp connection, event wiring
├── assets/                   # Static files (banner, thumbnail)
├── commands/                 # 156 commands across 13 categories
│   ├── converter/            # Media conversion (4)
│   ├── downloader/           # Platform downloaders (12)
│   ├── economy/              # Virtual economy (4)
│   ├── fun/                  # Entertainment (13)
│   ├── game/                 # Quiz & guessing games (30)
│   ├── general/              # Core bot commands (12)
│   ├── group/                # Group management (37)
│   ├── info/                 # Information lookups (6)
│   ├── media/                # Media generation (7)
│   ├── owner/                # Owner-only admin (19)
│   ├── productivity/         # Notes, reminders, todo (5)
│   ├── search/               # Web search (3)
│   └── tools/                # Utilities (4)
├── core/                     # Config, types, logger
├── data/games/               # 17 JSON game data files
├── game/                     # Game engine (GameManager, dispatcher, factory)
├── handlers/                 # Message processing, command dispatch, guards
├── infra/                    # Database, scrapers, API, loader, scheduler
├── middleware/                # 7 message middlewares
└── utils/                    # Utility functions
```

## Command catalog

### converter/

| Command  | Trigger(s)              | Description         |
| -------- | ----------------------- | ------------------- |
| `decode` | `decode`                | Decode encoded text |
| `encode` | `encode`                | Encode text         |
| `toimg`  | `toimg`, `stickertoimg` | Sticker → image     |
| `tomp3`  | `tomp3`                 | Video/audio → MP3   |

### downloader/

| Command     | Trigger(s)             | Description                  |
| ----------- | ---------------------- | ---------------------------- |
| `fbdl`      | `fbdl`, `fb`           | Facebook video download      |
| `igdl`      | `igdl`, `ig`           | Instagram download           |
| `mediafire` | `mediafire`, `mf`      | MediaFire download           |
| `pindl`     | `pindl`, `pin`         | Pinterest download           |
| `scdl`      | `scdl`, `sc`           | SoundCloud download          |
| `spotify`   | `spotify`, `sp`        | Spotify track/album download |
| `threadsdl` | `threadsdl`            | Threads post download        |
| `ttdl`      | `ttdl`, `tt`, `tiktok` | TikTok download              |
| `xdl`       | `xdl`, `x`, `twitter`  | X/Twitter download           |
| `ytmp3`     | `ytmp3`, `yta`         | YouTube → MP3                |
| `ytmp4`     | `ytmp4`, `ytv`         | YouTube → MP4                |

> All downloaders use `src/infra/scrapers/` — see [Scrapers](#scrapers) section.

### economy/

| Command    | Trigger(s)       | Description              |
| ---------- | ---------------- | ------------------------ |
| `daily`    | `daily`          | Daily reward claim       |
| `shop`     | `shop`           | Browse shop items        |
| `transfer` | `transfer`, `tf` | Transfer money to user   |
| `wallet`   | `wallet`, `bal`  | View wallet/bank balance |

### fun/

| Command     | Trigger(s)          | Description                |
| ----------- | ------------------- | -------------------------- |
| `anonymous` | `anonymous`, `anon` | Send anonymous messages    |
| `emojimix`  | `emojimix`          | Mix two emojis             |
| `fakta`     | `fakta`             | Random fun fact            |
| `meme`      | `meme`              | Random meme                |
| `menfess`   | `menfess`           | Send confession to someone |
| `quotes`    | `quotes`, `quote`   | Random quote               |
| `rate`      | `rate`              | Rate something (0-100)     |
| `ship`      | `ship`              | Ship two people            |
| `siapayg`   | `siapayg`           | "Who is it?" random pick   |
| `tod`       | `tod`               | Truth or Dare              |
| `waifu`     | `waifu`             | Random waifu image         |
| `wyr`       | `wyr`               | Would You Rather           |
| `zodiak`    | `zodiak`            | Zodiac sign info           |

### game/

| Command            | Trigger(s)             | Description                 |
| ------------------ | ---------------------- | --------------------------- |
| `asahotak`         | `asahotak`             | Brain teaser                |
| `caklontong`       | `caklontong`           | Cak Lontong quiz            |
| `coinflip`         | `coinflip`, `cf`       | Coin flip                   |
| `dice`             | `dice`                 | Dice roll                   |
| `duel`             | `duel`                 | 1v1 user duel               |
| `family100`        | `family100`, `f100`    | Family 100 quiz             |
| `gamerules`        | `gamerules`            | Game rules/help             |
| `hangman`          | `hangman`              | Hangman                     |
| `math`             | `math`                 | Math quiz                   |
| `quiz`             | `quiz`                 | General quiz                |
| `siapakahaku`      | `siapakahaku`          | "Who am I?" quiz            |
| `slot`             | `slot`                 | Slot machine                |
| `suit`             | `suit`                 | Rock-Paper-Scissors         |
| `susunkata`        | `susunkata`            | Word scramble               |
| `tebakangka`       | `tebakangka`           | Number guessing             |
| `tebakanime`       | `tebakanime`           | Anime character guessing    |
| `tebakbendera`     | `tebakbendera`, `flag` | Country flag guessing       |
| `tebakgambar`      | `tebakgambar`, `tg`    | Image guessing              |
| `tebakkabupaten`   | `tebakkabupaten`       | Indonesian regency guessing |
| `tebakkalimat`     | `tebakkalimat`         | Sentence guessing           |
| `tebakkata`        | `tebakkata`            | Word guessing               |
| `tebakkimia`       | `tebakkimia`           | Chemistry element guessing  |
| `tebaklirik`       | `tebaklirik`           | Song lyrics guessing        |
| `tebakmemberjkt48` | `tebakmemberjkt48`     | JKT48 member guessing       |
| `tebaktebakan`     | `tebaktebakan`         | Riddle guessing             |
| `tebakwaifu`       | `tebakwaifu`           | Waifu image guessing        |
| `tekateki`         | `tekateki`             | Riddle guessing             |
| `tictactoe`        | `tictactoe`, `ttt`     | Tic Tac Toe (2 players)     |
| `trivia`           | `trivia`               | Trivia quiz                 |
| `wordchain`        | `wordchain`            | Word chain                  |

> Games use `src/game/` engine — see [Game system](#game-system) section.

### general/

| Command      | Trigger(s)          | Description              |
| ------------ | ------------------- | ------------------------ |
| `confess`    | `confess`           | Send confession to owner |
| `level`      | `level`, `rank`     | View level/rank card     |
| `menu`       | `menu`, `help`      | Command menu             |
| `owner`      | `owner`             | Owner info               |
| `ping`       | `ping`              | Ping/latency             |
| `profile`    | `profile`, `me`     | User profile             |
| `report`     | `report`            | Report issue to owner    |
| `runtime`    | `runtime`, `uptime` | Bot uptime               |
| `speed`      | `speed`             | Speed test               |
| `status`     | `status`            | Bot status               |
| `totalfitur` | `totalfitur`        | Total features count     |

### group/

| Command        | Trigger(s)           | Description                    |
| -------------- | -------------------- | ------------------------------ |
| `absen`        | `absen`              | Attendance check-in            |
| `add`          | `add`                | Add member to group            |
| `antidelete`   | `antidelete`         | Toggle anti-delete             |
| `antilink`     | `antilink`           | Toggle anti-link               |
| `antispam`     | `antispam`           | Toggle anti-spam               |
| `antiviewonce` | `antiviewonce`       | Toggle anti-view-once          |
| `autoreply`    | `autoreply`          | Manage keyword auto-replies    |
| `autosticker`  | `autosticker`        | Toggle auto-sticker            |
| `demote`       | `demote`             | Demote admin                   |
| `goodbye`      | `goodbye`            | Toggle goodbye message         |
| `groupinfo`    | `groupinfo`, `ginfo` | Group info                     |
| `groupstats`   | `groupstats`         | Group statistics               |
| `hidetag`      | `hidetag`            | Hidden tag all members         |
| `kick`         | `kick`               | Kick member                    |
| `kickall`      | `kickall`            | Kick all non-admin members     |
| `leaderboard`  | `leaderboard`, `lb`  | Group leaderboard              |
| `leave`        | `leave`              | Bot leave group                |
| `link`         | `link`               | Get group invite link          |
| `lock`         | `lock`               | Lock group (admin-only send)   |
| `mute`         | `mute`               | Mute group (bot stops respond) |
| `poll`         | `poll`               | Create poll                    |
| `promote`      | `promote`            | Promote to admin               |
| `revoke`       | `revoke`             | Revoke group invite link       |
| `rules`        | `rules`              | Set/view group rules           |
| `set`          | `set`                | Toggle group settings          |
| `setdesc`      | `setdesc`            | Set group description          |
| `setname`      | `setname`            | Set group name                 |
| `sider`        | `sider`              | Detect silent members          |
| `tagall`       | `tagall`             | Tag all members                |
| `unlock`       | `unlock`             | Unlock group                   |
| `unmute`       | `unmute`             | Unmute group                   |
| `unwarn`       | `unwarn`             | Remove warnings                |
| `votekick`     | `votekick`           | Vote to kick a member          |
| `warn`         | `warn`               | Warn member                    |
| `warnlist`     | `warnlist`           | List warnings                  |
| `welcome`      | `welcome`            | Toggle welcome message         |

### info/

| Command        | Trigger(s)         | Description             |
| -------------- | ------------------ | ----------------------- |
| `cuaca`        | `cuaca`, `weather` | Weather info            |
| `gempa`        | `gempa`            | Earthquake info         |
| `github`       | `github`, `gh`     | GitHub repo info        |
| `jadwalsholat` | `jadwalsholat`     | Prayer schedule         |
| `kurs`         | `kurs`             | Currency exchange rates |
| `npm`          | `npm`              | NPM package info        |

### media/

| Command    | Trigger(s)     | Description             |
| ---------- | -------------- | ----------------------- |
| `carbon`   | `carbon`       | Carbon.sh code image    |
| `hitamkan` | `hitamkan`     | Darken/contrast image   |
| `ocr`      | `ocr`          | Extract text from image |
| `qr`       | `qr`, `qrcode` | QR code generator       |
| `ssweb`    | `ssweb`, `ss`  | Screenshot website      |
| `sticker`  | `sticker`, `s` | Image/video → sticker   |
| `tts`      | `tts`          | Text to speech          |

### owner/

| Command     | Trigger(s)        | Description                |
| ----------- | ----------------- | -------------------------- |
| `addlevel`  | `addlevel`        | Add level to user          |
| `addxp`     | `addxp`           | Add XP to user             |
| `ban`       | `ban`             | Ban user                   |
| `block`     | `block`           | Block WhatsApp user        |
| `broadcast` | `broadcast`, `bc` | Broadcast message to all   |
| `delpp`     | `delpp`           | Delete bot profile picture |
| `eval`      | `eval`, `>`       | Evaluate JS code           |
| `evalAsync` | `evalasync`       | Async evaluate JS          |
| `join`      | `join`            | Join group via invite link |
| `leave`     | `leave`           | Leave group                |
| `listgroup` | `listgroup`, `lg` | List all groups            |
| `setlevel`  | `setlevel`        | Set user level             |
| `setname`   | `setname`         | Set bot display name       |
| `setpp`     | `setpp`           | Set bot profile picture    |
| `setprefix` | `setprefix`       | Set command prefix         |
| `setstatus` | `setstatus`       | Set bot status/about       |
| `setxp`     | `setxp`           | Set user XP                |
| `shutdown`  | `shutdown`        | Shutdown bot               |
| `unblock`   | `unblock`         | Unblock WhatsApp user      |

### productivity/

| Command    | Trigger(s)       | Description                 |
| ---------- | ---------------- | --------------------------- |
| `afk`      | `afk`            | Set AFK status with reason  |
| `note`     | `note`           | Save/retrieve notes         |
| `remind`   | `remind`, `rem`  | Set reminder                |
| `schedule` | `schedule`, `sk` | Schedule recurring messages |
| `todo`     | `todo`           | To-do list                  |

### search/

| Command      | Trigger(s)        | Description              |
| ------------ | ----------------- | ------------------------ |
| `lirik`      | `lirik`, `lyrics` | Search song lyrics       |
| `pinterest`  | `pin`, `pins`     | Search Pinterest images  |
| `soundcloud` | `scsearch`        | Search SoundCloud tracks |

### tools/

| Command     | Trigger(s)        | Description                  |
| ----------- | ----------------- | ---------------------------- |
| `calc`      | `calc`, `math`    | Calculator                   |
| `resi`      | `resi`            | Package tracking (Indonesia) |
| `short`     | `short`, `url`    | URL shortener                |
| `translate` | `translate`, `tr` | Translate text               |

## Adding a command

Create `src/commands/<category>/<name>.ts` — auto-loaded at startup. Hot-reloaded in dev.

```ts
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "MyCommand",
  alias: ["trigger"],
  description: "What it does",
  usage: "{prefix}mycommand <arg>",
  tags: ["fun"],
  // ownerOnly, groupOnly, privateOnly, adminOnly, botAdmin, cooldown (seconds), enabled
  handler: async (_sock, msg) => {
    await msg.reply("Hello!");
  },
});
```

### Command properties

| Property      | Type       | Default | Description                              |
| ------------- | ---------- | ------- | ---------------------------------------- |
| `name`        | `string`   | —       | Display name (required)                  |
| `command`     | `string`   | —       | Primary trigger (auto-set from filename) |
| `alias`       | `string[]` | `[]`    | Alternative triggers                     |
| `triggers`    | `string[]` | `[]`    | Additional triggers                      |
| `description` | `string`   | —       | Short description                        |
| `usage`       | `string`   | —       | Usage template with `{prefix}`           |
| `tags`        | `string[]` | `[]`    | Category tags for menu grouping          |
| `enabled`     | `boolean`  | `true`  | Whether command is active                |
| `ownerOnly`   | `boolean`  | `false` | Owner-only                               |
| `groupOnly`   | `boolean`  | `false` | Groups only                              |
| `privateOnly` | `boolean`  | `false` | Private chats only                       |
| `adminOnly`   | `boolean`  | `false` | Group admin only                         |
| `botAdmin`    | `boolean`  | `false` | Requires bot to be group admin           |
| `cooldown`    | `number`   | `0`     | Cooldown in seconds                      |

Triggers are auto-collected from: `triggers[]`, `command`, `alias[]`, and the filename (without
`.ts`). Use the `args` property to get message arguments (already split by `" "`).

### MessageResolver (`msg`) reference

The `msg` parameter is a `MessageResolver` (see `src/utils/message-resolver.ts`).

| Field/Method      | Type                     | Description                                     |
| ----------------- | ------------------------ | ----------------------------------------------- |
| `id`              | `string`                 | Message ID                                      |
| `jid`             | `string`                 | Chat JID                                        |
| `sender`          | `string`                 | Sender JID (group: participant JID)             |
| `body`            | `string`                 | Raw message text                                |
| `isGroup`         | `boolean`                | Is this a group chat?                           |
| `isAdmin`         | `boolean`                | Is sender a group admin?                        |
| `isBotAdmin`      | `boolean`                | Is bot a group admin?                           |
| `fromMe`          | `boolean`                | Sent by bot itself?                             |
| `isOwner`         | `boolean`                | Is sender an owner?                             |
| `mentioned`       | `string[]`               | Mentioned JIDs                                  |
| `mtype`           | `string`                 | Message type (conversation, imageMessage, etc.) |
| `message`         | ` proto.IWebMessageInfo` | Raw Baileys message object                      |
| `key`             | `IMessageKey`            | Message key                                     |
| `pushName`        | `string`                 | Sender push name                                |
| `raw`             | `string`                 | Raw body text                                   |
| `args`            | `string[]`               | Space-split arguments after command             |
| `quoted`          | `object \| null`         | Quoted message (if any)                         |
| `reply(text)`     | method                   | Reply in same chat                              |
| `send(jid, text)` | method                   | Send to specific JID                            |

## Architecture

### Entry point (`src/index.ts`)

1. Loads all commands via `loadCommands()`
2. Creates WhatsApp socket with `useMultiFileAuthState("auth")`
3. Handles pairing code for first-time registration
4. Listens for `connection.update` (QR code display, reconnect with exponential backoff)
5. On connection open: starts schedulers, syncs group names to database
6. Anti-call: rejects all incoming calls
7. Group events: `groups.upsert` (sync participants), `group-participants.update` (welcome/goodbye)
8. Message events: `messages.upsert` → `handleMessagesUpsert()`, `messages.update` → `handleMessagesUpdate()`

### Message flow

```
Incoming Message
  → resolveMessage()              [src/utils/message-resolver.ts]
  → runMiddlewares()              [src/middleware/index.ts]
      → 1. Anti-ViewOnce          [src/middleware/anti-viewonce.ts]
      → 2. Anti-Link              [src/middleware/anti-link.ts]
      → 3. Anti-Spam              [src/middleware/anti-spam.ts]
      → 4. AFK                    [src/middleware/afk.ts]
      → 5. Game Answer            [src/middleware/game-answer.ts]
      → 6. Auto-Reply             [src/middleware/auto-reply.ts]
  → dispatchCommand()            [src/handlers/command-dispatcher.ts]
      → checkGuards()            [src/handlers/command-guards.ts]
      → cmd.handler()
      → Level-up detection
```

### Connection lifecycle

- **First run**: Shows pairing code, waits for QR scan or code entry
- **Subsequent runs**: Loads session from `auth/` directory
- **Disconnect**: Exponential backoff reconnect (1s → 2s → 4s → ... → 30s max)
- **QR timeout**: Regenerates QR code every 20 seconds

## Database

`bun:sqlite` WAL mode, single `data.db` file. Tables created lazily via `CREATE TABLE IF NOT EXISTS` + `safeMigrate()` for schema evolution. Access re-exported through `src/infra/database.ts` facade.

### Tables

#### `users`

| Column     | Type    | Description                |
| ---------- | ------- | -------------------------- |
| `jid`      | TEXT PK | WhatsApp JID               |
| `hits`     | INTEGER | Command usage count        |
| `banned`   | INTEGER | 0 = active, 1 = banned     |
| `lastChat` | INTEGER | Last interaction timestamp |
| `xp`       | INTEGER | Experience points          |
| `level`    | INTEGER | User level                 |

#### `groups`

| Column         | Type    | Description                   |
| -------------- | ------- | ----------------------------- |
| `jid`          | TEXT PK | Group JID                     |
| `name`         | TEXT    | Group name                    |
| `welcome`      | INTEGER | Welcome message enabled (0/1) |
| `goodbye`      | INTEGER | Goodbye message enabled (0/1) |
| `antilink`     | INTEGER | Anti-link enabled (0/1)       |
| `antidelete`   | INTEGER | Anti-delete enabled (0/1)     |
| `antispam`     | INTEGER | Anti-spam enabled (0/1)       |
| `mute`         | INTEGER | Muted (0/1)                   |
| `autosticker`  | INTEGER | Auto-sticker enabled (0/1)    |
| `onlyAdmin`    | INTEGER | Admin-only send (0/1)         |
| `welcomeMsg`   | TEXT    | Custom welcome message        |
| `goodbyeMsg`   | TEXT    | Custom goodbye message        |
| `warnMax`      | INTEGER | Max warnings before kick      |
| `antiviewonce` | INTEGER | Anti-view-once enabled (0/1)  |

#### `group_members`

| Column      | Type    | Description               |
| ----------- | ------- | ------------------------- |
| `groupJid`  | TEXT PK | Group JID (composite PK)  |
| `memberJid` | TEXT PK | Member JID (composite PK) |
| `lastChat`  | INTEGER | Last message timestamp    |
| `chatCount` | INTEGER | Message count             |

#### `economy`

| Column      | Type    | Description           |
| ----------- | ------- | --------------------- |
| `jid`       | TEXT PK | WhatsApp JID          |
| `wallet`    | INTEGER | Cash in wallet        |
| `bank`      | INTEGER | Cash in bank          |
| `lastDaily` | INTEGER | Last daily claim time |

#### `afk`

| Column      | Type    | Description    |
| ----------- | ------- | -------------- |
| `jid`       | TEXT PK | WhatsApp JID   |
| `reason`    | TEXT    | AFK reason     |
| `timestamp` | INTEGER | AFK start time |

#### `autoreplies`

| Column      | Type       | Description               |
| ----------- | ---------- | ------------------------- |
| `id`        | INTEGER PK | Auto-increment ID         |
| `groupJid`  | TEXT       | Group JID (NULL = global) |
| `trigger`   | TEXT       | Keyword trigger           |
| `response`  | TEXT       | Reply text                |
| `createdBy` | TEXT       | Creator JID               |

#### `polls`

| Column      | Type       | Description           |
| ----------- | ---------- | --------------------- |
| `id`        | INTEGER PK | Auto-increment ID     |
| `groupJid`  | TEXT       | Group JID             |
| `creator`   | TEXT       | Creator JID           |
| `question`  | TEXT       | Poll question         |
| `options`   | TEXT       | JSON array of options |
| `votes`     | TEXT       | JSON object of votes  |
| `active`    | INTEGER    | Is poll active (0/1)  |
| `timestamp` | INTEGER    | Creation time         |

#### `warns`

| Column      | Type       | Description       |
| ----------- | ---------- | ----------------- |
| `id`        | INTEGER PK | Auto-increment ID |
| `groupJid`  | TEXT       | Group JID         |
| `memberJid` | TEXT       | Member JID        |
| `reason`    | TEXT       | Warning reason    |
| `timestamp` | INTEGER    | Warning time      |

#### `reminders`

| Column      | Type       | Description           |
| ----------- | ---------- | --------------------- |
| `id`        | INTEGER PK | Auto-increment ID     |
| `jid`       | TEXT       | Creator JID           |
| `chatJid`   | TEXT       | Chat to send reminder |
| `message`   | TEXT       | Reminder text         |
| `triggerAt` | INTEGER    | When to fire          |
| `done`      | INTEGER    | Already sent (0/1)    |

#### `schedules`

| Column      | Type       | Description          |
| ----------- | ---------- | -------------------- |
| `id`        | INTEGER PK | Auto-increment ID    |
| `chatJid`   | TEXT       | Chat to send message |
| `creator`   | TEXT       | Creator JID          |
| `message`   | TEXT       | Message text         |
| `triggerAt` | INTEGER    | Next trigger time    |
| `repeat`    | TEXT       | Repeat interval      |
| `done`      | INTEGER    | Cancelled (0/1)      |

### Repositories

All repos are in `src/infra/repositories/` and re-exported via `src/infra/database.ts`.

| Repository       | File                | Key functions                                                                                                                                                                        |
| ---------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `user-repo`      | `user-repo.ts`      | `getUser()`, `addXp()`, `addHit()`, `setLevel()`, `addLevel()`, `setXp()`, `setBanned()`, `isBanned()`                                                                               |
| `group-repo`     | `group-repo.ts`     | `getGroup()`, `setGroup()`, `updateMemberChat()`, `getSiders()`                                                                                                                      |
| `economy-repo`   | `economy-repo.ts`   | `getEconomy()`, `addWallet()`, `setLastDaily()`, `transferMoney()`                                                                                                                   |
| `afk-repo`       | `afk-repo.ts`       | `setAfk()`, `getAfk()`, `removeAfk()`                                                                                                                                                |
| `autoreply-repo` | `autoreply-repo.ts` | `addAutoReply()`, `removeAutoReply()`, `getAutoReplies()`, `findAutoReply()`                                                                                                         |
| `poll-repo`      | `poll-repo.ts`      | `createPoll()`, `getPoll()`, `getPollOptions()`, `getPollVotes()`, `votePoll()`, `closePoll()`                                                                                       |
| `warn-repo`      | `warn-repo.ts`      | `addWarn()`, `getWarns()`, `removeWarns()`                                                                                                                                           |
| `schedule-repo`  | `schedule-repo.ts`  | `addReminder()`, `getPendingReminders()`, `markReminderDone()`, `addSchedule()`, `getPendingSchedules()`, `markScheduleDone()`, `reschedule()`, `getSchedules()`, `deleteSchedule()` |

## Game system

### Components

| File                            | Purpose                                           |
| ------------------------------- | ------------------------------------------------- |
| `src/game/game.ts`              | Central dispatcher — tries all 19 game checkers   |
| `src/game/game-helper.ts`       | `GameManager` class — sessions, hints, XP rewards |
| `src/game/word-game-factory.ts` | Creates word-guessing games from JSON configs     |
| `src/game/types.ts`             | `WordGameConfig<T>` interface                     |

### GameManager

- Manages game sessions per group JID (one active game per group)
- 60-second timeout per round
- Hint system: reveals characters gradually
- XP rewards for correct answers

### Word game factory

`createWordGame(config)` generates a complete command from a `WordGameConfig`:

- `questionKey` — field in JSON data for the question/word
- `answerKey` — field for the answer
- `hintStyle` — how hints are shown (e.g., underscores, first letter)
- Used by 16 of the 30 game commands

### Game data files

17 JSON files in `src/data/games/`:
`asahotak.json`, `caklontong.json`, `family100.json`, `siapakahaku.json`, `susunkata.json`, `tebakanime.json`, `tebakbendera.json`, `tebakgambar.json`, `tebakkabupaten.json`, `tebakkalimat.json`, `tebakkata.json`, `tebakkimia.json`, `tebaklirik.json`, `tebakmemberjkt48.json`, `tebaktebakan.json`, `tebakwaifu.json`, `tekateki.json`

### Adding a new game

1. Create `src/data/games/mygame.json` with question/answer pairs
2. Create `src/commands/game/mygame.ts` using `defineCommand()`
3. Register in `src/game/game.ts` dispatcher's checker list
4. If word-guessing type, use `createWordGame()` from `src/game/word-game-factory.ts`

## Middleware pipeline

Each middleware returns `"next"` to continue or `"stop"` to halt processing.

| Order | File               | Behavior                                                          |
| ----- | ------------------ | ----------------------------------------------------------------- |
| 1     | `anti-viewonce.ts` | Forwards view-once messages to owner (always continues)           |
| 2     | `anti-link.ts`     | Deletes messages containing URLs when antilink is enabled         |
| 3     | `anti-spam.ts`     | Rate-limits: 5 messages per 10-second window per user             |
| 4     | `afk.ts`           | Auto-clears AFK on activity; notifies if AFK user is mentioned    |
| 5     | `game-answer.ts`   | Captures game answers from any text message (intercepts if match) |
| 6     | `auto-reply.ts`    | SQLite-based keyword auto-replies per group                       |

### Adding a middleware

1. Create `src/middleware/my-middleware.ts`
2. Export a function matching `MessageMiddleware` type
3. Add to `middlewares[]` array in `src/middleware/index.ts`

## Handlers

| File                    | Purpose                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `message-handler.ts`    | Processes incoming messages: resolves, runs middlewares, dispatches. Also handles anti-delete detection via `messages.update` events. |
| `command-dispatcher.ts` | Resolves command from triggers, executes handler, detects level-ups                                                                   |
| `command-guards.ts`     | Checks `enabled`, `ownerOnly`, `groupOnly`, `privateOnly`, `adminOnly`, `botAdmin`, `cooldown`                                        |
| `command-service.ts`    | `listCommands()`, `findCommand()`, `setCommandEnabled()` — used by API                                                                |
| `group-handler.ts`      | Handles `group-participants.update` — welcome/goodbye messages                                                                        |
| `group-service.ts`      | `listGroups()`, `getGroupByJid()`, `updateGroupSettings()` — used by API                                                              |
| `message-context.ts`    | `MessageContext` interface definition                                                                                                 |
| `interactive.ts`        | WhatsApp interactive message builder with buttons                                                                                     |

## Infrastructure

### Command loader (`src/infra/loader.ts`)

- Scans `src/commands/**/*.ts` at startup
- Each file's `default` export must be a `Command` from `defineCommand()`
- Stores in `Map<string, Command>` keyed by trigger
- **Hot-reload in dev**: `fs.watch()` on commands directory, re-loads changed files

### Scheduler (`src/infra/scheduler.ts`)

- Polls every 30 seconds for pending reminders and schedules
- Sends messages when `triggerAt` time is reached
- Marks reminders as done, handles repeat schedules

### API client (`src/infra/api.ts`)

- HTTP client wrapper for `api.seaavey.com`
- Methods: `api.get(path)`, `api.post(path, data)`
- Used by some commands for server-side processing

### Group metadata cache (`src/infra/group-metadata-cache.ts`)

- TTL-based cache for group metadata (avoids repeated WhatsApp API calls)
- `getCachedGroupMetadata(jid)` — returns cached or fetches fresh
- `invalidateGroupMetadata(jid)` — clears cache for a group

## Scrapers

All scrapers are in `src/infra/scrapers/`, re-exported via `src/infra/scrapers/index.ts`.

| Scraper    | File            | Source(s)                                            |
| ---------- | --------------- | ---------------------------------------------------- |
| YouTube    | `youtube.ts`    | yt-dlp (primary), loader.to (fallback)               |
| Spotify    | `spotify.ts`    | musicfab.io (download), spotify.xwolf.space (search) |
| SoundCloud | `soundcloud.ts` | SoundCloud API v2                                    |
| Facebook   | `fbdl.ts`       | fsaver.net                                           |
| Threads    | `threads.ts`    | threads worker.dev                                   |

### Scraper pattern

```ts
// src/infra/scrapers/index.ts
export interface ScraperResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

Each scraper exports typed functions (e.g., `youtubeDownload(url)`, `spotifySearch(query)`).

### Adding a scraper

1. Create `src/infra/scrapers/myservice.ts`
2. Export functions returning `ScraperResult<T>`
3. Add to `src/infra/scrapers/index.ts` barrel export
4. Create command in `src/commands/downloader/` that calls the scraper

## Utilities

| File                  | Purpose                                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `helper.ts`           | `getRandomItem()`, `getRandomNumber()`, `getNumber()`, `formatSize()`, `formatTime()`, `getProfilePictureUrl()`, `loadGameData()`, `safeFetchJSON()` |
| `convert.ts`          | `imageToSticker()`, `videoToSticker()`, `toMp3()`, `stickerToImage()` — uses ffmpeg + node-webpmux                                                   |
| `ai.ts`               | `img2img()` — Google Gemini AI image-to-image wrapper                                                                                                |
| `group-toggle.ts`     | `toggleCommand()` — factory for on/off toggle commands                                                                                               |
| `message-resolver.ts` | `MessageResolver` interface, `resolveMessage()` — parses incoming WhatsApp messages                                                                  |
| `ttl-map.ts`          | `TtlMap` class — Map with automatic key expiration                                                                                                   |

## Key packages

| Package             | Purpose                             |
| ------------------- | ----------------------------------- |
| baileys ^7.0.0-rc13 | WhatsApp Web protocol               |
| sharp ^0.34.5       | Rank card / welcome image rendering |
| axios ^1.16.1       | HTTP client                         |
| cheerio ^1.2.0      | HTML parsing (web scraping)         |
| node-webpmux ^3.2.1 | WebP metadata for stickers          |
| pino-pretty ^13.1.3 | Pretty-printed log output           |
| qrcode ^1.5.4       | QR code generation                  |
| eslint ^10.5.0      | Linter                              |
| prettier ^3.8.4     | Formatter (TS, JSON, Markdown)      |

## TypeScript quirks

- ESM only (`"type": "module"`) — use `import type` for type-only imports (`verbatimModuleSyntax`)
- Path alias: `@/*` → `./src/*`
- `exactOptionalPropertyTypes: true` — be careful with optional fields
- `noUncheckedIndexedAccess: true` — array/dict access may return `undefined`
- `noUnusedLocals` / `noUnusedParameters` are **off** (never errors)
- `noExplicitAny` is **error** in ESLint — use `unknown` instead

## Key conventions

- **No tests** — `*.test.*` is gitignored, no test framework installed (except scraper `__tests__/`)
- Logger: `import { logger } from "@/core/logger"` — Pino with daily file + pretty console
- Database access: re-exported through `src/infra/database.ts` facade
- Group settings: accessed via `getGroup(jid)` from `src/infra/repositories/group-repo`
- Game data JSON files live in `src/data/games/`
- **No console.log** — ESLint warns on `no-console`. Use the logger instead.
- **No `any`** — ESLint errors on `no-explicit-any`. Use `unknown` and narrow.
- Bot prefix defaults to `.` (configurable at runtime via `setprefix`)
- Owner numbers are comma-separated in `OWNER_NUMBER` env var
- Env vars: `OWNER_NUMBER`, `NODE_ENV`
- ESLint also errors on `no-unused-vars` and `no-unused-imports`; warns on `no-non-null-assertion`
- **Use command guard properties** — never manually check `msg.isGroup`, `msg.isAdmin`, `msg.isBotAdmin`, or `msg.isOwner` inside handlers. Set `groupOnly`, `adminOnly`, `botAdmin`, `ownerOnly`, or `privateOnly` in `defineCommand()` instead. The `checkGuards()` system handles all of these uniformly.
- **Unused args** — prefix with `_` (e.g., `_sock`) to satisfy ESLint's `no-unused-vars`

## Deployment

- PM2 config at `ecosystem.config.cjs` — uses `bun` interpreter, autorestart with max 10 restarts
- Docker: `docker build -t seaaveybot .` then mount `auth/` and `data/` volumes
- Must mount `./auth` (WhatsApp session) and `./data` (database) volumes in Docker
- FFmpeg required on host (for media conversion)
- Installer scripts: `setup_vps.sh` (VPS), `setup_termux.sh` (Termux/Android)

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Ponytail Mode

We are in **ponytail full mode**. Before writing any code, apply the default ladder:

1. **YAGNI**: Does it need to exist at all?
2. **Standard Library**: Does the standard library do it?
3. **Native Platform**: Is there a native platform feature?
4. **One Line**: Can it be done in one line?
5. **Minimum**: Build the minimum that works.

No unrequested abstractions, no avoidable dependencies, no boilerplate. Mark intentional simplifications with a `// ponytail:` (or appropriate language syntax) comment.
