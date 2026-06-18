# Migration: API → Scraper

Migrate from `api.seaavey.com` to direct scraping using existing downloader websites.

## Why

- **Independent** — no dependency on a single API server
- **Stable** — if one website goes down, swap to backup
- **Free** — no API key required
- **Flexible** — change websites anytime

## Dependencies

Already in `package.json`:

- `axios` — HTTP requests
- `cheerio` — HTML parsing

## Completed

### ✅ Server Removal (2026-06-17)

- Deleted `src/server/` directory and all 8 route modules
- Removed `elysia` and `@elysiajs/cors` dependencies
- Removed `startServer` import and call from `src/index.ts`
- Updated `AGENTS.md` to reflect removal
- Removed deprecated `baseUrl` from `tsconfig.json`

### ✅ Scraper Infrastructure (2026-06-17)

- Created `src/infra/scrapers/` directory
- Created `ScraperResult<T>` generic type with `scraperSuccess()` and `scraperError()` helpers
- Created barrel export in `src/infra/scrapers/index.ts`

### ✅ Facebook Downloader (2026-06-17)

- Created `src/infra/scrapers/fbdl.ts` — scrapes fsaver.net
- Updated `src/commands/downloader/fbdl.ts` to use new scraper
- Created tests in `src/infra/scrapers/__tests__/fbdl.test.ts`

### ✅ Spotify Scraper (2026-06-17)

- Created `src/infra/scrapers/spotify.ts` with:
  - `spotify(url)` — get track info + download link from musicfab.io
  - `spotifySearch(query, limit)` — search tracks from spotify.xwolf.space
- Updated `src/commands/downloader/spotify.ts` to use new scraper
- Created tests in `src/infra/scrapers/__tests__/spotify.test.ts`

### ✅ Instagram Downloader (2026-06-18)

- Created `src/infra/scrapers/instagram.ts` — scrapes insaver.io
- Updated `src/commands/downloader/igdl.ts` to use new scraper
- Cookie forwarding for CSRF token validation

### ✅ Threads Downloader (2026-06-18)

- Created `src/infra/scrapers/threads.ts` — scrapes threadsvideo.romitkr5539.workers.dev
- Updated `src/commands/downloader/threadsdl.ts` to use new scraper
- Created tests in `src/infra/scrapers/__tests__/threads.test.ts`

### ✅ SoundCloud Scraper (2026-06-18)

- Created `src/infra/scrapers/soundcloud.ts` with:
  - `soundcloudSearch(query, limit)` — search tracks from SoundCloud API v2
  - `soundcloudDl(url)` — get track info + stream URL via resolve endpoint
- Client ID extracted from `window.__sc_hydration` (apiClient.id)
- Updated `src/commands/search/soundcloud.ts` to use new scraper
- Updated `src/commands/downloader/scdl.ts` to use new scraper
- Created tests in `src/infra/scrapers/__tests__/soundcloud.test.ts`

### ✅ YouTube Downloader (2026-06-18)

- Created `src/infra/scrapers/youtube.ts` with:
  - `ytmp3(url)` — download audio (128kbps) from loader.to
  - `ytmp4(url)` — download video (720p) from loader.to
- Updated `src/commands/downloader/ytmp3.ts` to use new scraper
- Updated `src/commands/downloader/ytmp4.ts` to use new scraper

### ✅ Pinterest Scraper (2026-06-18)

- Created `src/infra/scrapers/pinterest.ts` — scrapes pinterest.com directly
- `pinterestSearch(query, limit)` — parse search page for 736x thumbnails + alt text
- `pinterestDl(url)` — resolve pin.it short URLs via redirect chain, extract originals
- No API key required, no Cloudflare blocks
- Updated `src/commands/search/pinterest.ts` to use new scraper
- Updated `src/commands/downloader/pindl.ts` to use new scraper

## Commands to Migrate

| Command        | Target Website                         | Scraper File                       | Status |
| -------------- | -------------------------------------- | ---------------------------------- | ------ |
| `.fbdl`        | `fsaver.net`                           | `src/infra/scrapers/fbdl.ts`       | ✅     |
| `.spotify`     | `musicfab.io` + `spotify.xwolf.space`  | `src/infra/scrapers/spotify.ts`    | ✅     |
| `.ytmp3`       | `loader.to`                            | `src/infra/scrapers/youtube.ts`    | ✅     |
| `.ytmp4`       | `loader.to`                            | `src/infra/scrapers/youtube.ts`    | ✅     |
| `.igdl`        | `insaver.io`                           | `src/infra/scrapers/instagram.ts`  | ✅     |
| `.soundcloud`  | `api-v2.soundcloud.com`                | `src/infra/scrapers/soundcloud.ts` | ✅     |
| `.scdl`        | `api-v2.soundcloud.com`                | `src/infra/scrapers/soundcloud.ts` | ✅     |
| `.pinterest`   | `pinterest.com` (HTML scraping)        | `src/infra/scrapers/pinterest.ts`  | ✅     |
| `.pinterestdl` | `pinterest.com` (HTML scraping)        | `src/infra/scrapers/pinterest.ts`  | ✅     |
| `.lirik`       | `genius.com` (public API)              | `src/infra/scrapers/genius.ts`     | ⏳     |
| `.mediafire`   | `mediafire.com` (direct)               | `src/infra/scrapers/mediafire.ts`  | ⏳     |
| `.threadsdl`   | `threadsvideo.romitkr5539.workers.dev` | `src/infra/scrapers/threads.ts`    | ✅     |
| `.xdl`         | `savetwitter.net`                      | `src/infra/scrapers/twitter.ts`    | ⏳     |
| `.ssweb`       | `pageshot.site`                        | `src/infra/scrapers/ssweb.ts`      | ⏳     |

## Downloader Websites per Service

### Facebook (fbdl)

**Primary:** `fsaver.net`

```
POST https://fsaver.net/api/challenge
Body: { url: fb_url }

POST https://fsaver.net/en/download
Body: url={url}&token={token}
```

### Spotify

**Download:** `musicfab.io`

```
POST https://musicfab.io/api/spotify
Body: { url: spotify_url }
Headers: Content-Type: application/json
```

**Search:** `spotify.xwolf.space`

```
GET https://spotify.xwolf.space/api/search?q={query}&type=track&limit={limit}
```

### YouTube (ytmp3 / ytmp4)

**Primary:** `loader.to`

```
GET https://loader.to/ajax/download.php?format={format}&url={video_url}
Headers: X-Requested-With: XMLHttpRequest

Response: { id, progress_url, title, info: { image } }

GET {progress_url}

Response: { progress: 1000, download_url, format }
```

Format codes: `mp3` (audio), `360`, `480`, `720`, `1080` (mp4)

### Instagram

**Primary:** `saveig.app`

```
POST https://saveig.app/api/download
Body: { url: ig_url }
```

**Backup:** `snapinsta.app`

```
POST https://snapinsta.app/api/download
Body: { url: ig_url }
```

### SoundCloud (search + download)

**Search:** SoundCloud API v2

```
GET https://api-v2.soundcloud.com/search/tracks?q={query}&client_id={client_id}&limit={limit}
```

**Download:** SoundCloud API v2 resolve

```
GET https://api-v2.soundcloud.com/resolve?url={track_url}&client_id={client_id}
```

**Stream:** Progressive stream from track media transcodings

```
GET {transcoding_url}?client_id={client_id}
```

Client ID extracted from `window.__sc_hydration` → `apiClient.id` on `https://soundcloud.com`.

### Pinterest (search)

**Primary:** Direct HTML scraping of `pinterest.com`

```
GET https://www.pinterest.com/search/pins/?q={query}
```

Parse 736x thumbnail URLs → convert to originals. Extract alt text and pin IDs.

### Pinterest (download)

**Primary:** Direct HTML scraping of `pinterest.com/pin/{id}/`

```
GET https://www.pinterest.com/pin/{pin_id}/
```

Extract `i.pinimg.com/originals/...` URL from page source. Short URLs (`pin.it`)
are resolved via redirect chain to extract pin ID first.

### Genius / Lyrics

**Primary:** Genius public API

```
GET https://genius.com/api/search/multi?q={query}
```

### MediaFire

**Primary:** Direct scrape `mediafire.com`

```
GET https://www.mediafire.com/file/{id}/{filename}/file
```

Parse download link from HTML using cheerio.

### Threads

**Primary:** `threadsvideo.romitkr5539.workers.dev`

```
GET https://threadsvideo.romitkr5539.workers.dev?url={threads_url}
```

### X / Twitter

**Primary:** `savetwitter.net`

```
POST https://savetwitter.net/api/download
Body: { url: tweet_url }
```

**Backup:** `fxtwitter.com` (fixes Twitter embeds)

```
GET https://api.fxtwitter.com/status/{tweet_id}
```

### Screenshot Web

**Primary:** `pageshot.site` (free, no key)

```
GET https://pageshot.site/api?url={url}&width=1280&height=720&format=png
```

**Backup:** `webshot.site`

```
GET https://webshot.site/api?url={url}&format=png
```

## File Structure

```
src/infra/scrapers/
├── index.ts           # Re-export all scrapers + ScraperResult<T>
├── fbdl.ts            # Facebook video download
├── spotify.ts         # Spotify download + search
├── youtube.ts         # ytmp3, ytmp4
├── instagram.ts       # Instagram media download
├── soundcloud.ts      # soundcloud search + download
├── pinterest.ts       # pinterest search + download
├── genius.ts          # lyrics search (TODO)
├── mediafire.ts       # mediafire download (TODO)
├── threads.ts         # threadsdl
├── twitter.ts         # xdl (TODO)
├── ssweb.ts           # screenshot web (TODO)
└── __tests__/
    ├── fbdl.test.ts
    ├── soundcloud.test.ts
    ├── spotify.test.ts
    ├── threads.test.ts
    └── youtube.test.ts
```

## Scraper Pattern

```ts
// src/infra/scrapers/index.ts
export interface ScraperResult<T> {
  status: boolean;
  data: T;
  error?: string;
}

export function scraperSuccess<T>(data: T): ScraperResult<T> {
  return { status: true, data };
}

export function scraperError<T>(error: string): ScraperResult<T> {
  return { status: false, data: [] as T, error };
}
```

```ts
// src/infra/scrapers/spotify.ts
import axios from "axios";
import type { ScraperResult } from "./index";
import { scraperError, scraperSuccess } from "./index";

export interface SpotifyData {
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  downloadUrl: string;
}

export async function spotify(url: string): Promise<ScraperResult<SpotifyData>> {
  try {
    const res = await axios.post(
      "https://musicfab.io/api/spotify",
      { url },
      {
        headers: {
          accept: "*/*",
          "content-type": "application/json",
          origin: "https://musicfab.io",
          referer: "https://musicfab.io/",
          "user-agent": UA,
        },
      },
    );

    const meta = res.data?.data?.metadata;
    if (!meta?.name) throw new Error("Track tidak ditemukan");

    return scraperSuccess({
      title: meta.name || "",
      artist: meta.artist || "",
      album: meta.album || "",
      duration: meta.duration || "",
      cover: meta.image || "",
      downloadUrl: meta.download || "",
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Unknown error");
  }
}
```

## Cleanup After Migration

- [ ] Delete `src/infra/api.ts`
- [ ] Remove `API_KEY` from `src/core/config.ts`
- [ ] Remove `API_KEY` from `.env.example`
- [ ] Update `README.md` — remove `API_KEY` row
- [ ] Remove all `from "@/infra/api"` imports in commands
- [ ] Update commands to use new scraper functions

## Notes

- **YouTube** is the trickiest — frequently changes anti-bot measures. Prepare 2-3 backup websites.
- **Spotify** full track download depends on third-party services. If a website goes down, find a replacement.
- **Instagram** — public posts only. Private stories require login.
- Always handle errors gracefully — if a website is down, return a clear error message.
- Test one by one after implementation.
