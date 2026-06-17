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

## Commands to Migrate

| Command        | Target Website                 | Scraper File                       |
| -------------- | ------------------------------ | ---------------------------------- |
| `.ytmp3`       | `y2mate.com`                   | `src/infra/scrapers/youtube.ts`    |
| `.ytmp4`       | `y2mate.com`                   | `src/infra/scrapers/youtube.ts`    |
| `.spotify`     | `spotifydown.com`              | `src/infra/scrapers/spotify.ts`    |
| `.igdl`        | `saveig.app`                   | `src/infra/scrapers/instagram.ts`  |
| `.soundcloud`  | `scdownloader.com`             | `src/infra/scrapers/soundcloud.ts` |
| `.scdl`        | `scdownloader.com`             | `src/infra/scrapers/soundcloud.ts` |
| `.pinterest`   | `pinterest.com` (internal API) | `src/infra/scrapers/pinterest.ts`  |
| `.pinterestdl` | `pinterestdownloader.com`      | `src/infra/scrapers/pinterest.ts`  |
| `.lirik`       | `genius.com` (public API)      | `src/infra/scrapers/genius.ts`     |
| `.mediafire`   | `mediafire.com` (direct)       | `src/infra/scrapers/mediafire.ts`  |
| `.threadsdl`   | `savefrom.net`                 | `src/infra/scrapers/threads.ts`    |
| `.xdl`         | `savetwitter.net`              | `src/infra/scrapers/twitter.ts`    |
| `.ssweb`       | `pageshot.site`                | `src/infra/scrapers/ssweb.ts`      |

## Downloader Websites per Service

### YouTube (ytmp3 / ytmp4)

**Primary:** `y2mate.com`

```
POST https://www.y2mate.com/mates/analyzeV2/ajax
Body: k_query={url}&k_page=home&hl=en&q_auto=0
```

Example:

- Input: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Request: `POST https://www.y2mate.com/mates/analyzeV2/ajax` with body `k_query=https://www.youtube.com/watch?v=dQw4w9WgXcQ&k_page=home&hl=en&q_auto=0`

**Backup:** `ssyoutube.com`

```
GET https://ssyoutube.com/api/convert?url={url}
```

Example:

- Input: `https://youtu.be/dQw4w9WgXcQ`
- Request: `GET https://ssyoutube.com/api/convert?url=https://youtu.be/dQw4w9WgXcQ`

**Backup 2:** `10downloader.com`

```
GET https://10downloader.com/download?v={url}
```

Example:

- Input: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Request: `GET https://10downloader.com/download?v=https://www.youtube.com/watch?v=dQw4w9WgXcQ`

### Spotify

**Primary:** `spotifydown.com`

```
POST https://spotifydown.com/download
Body: { url: track_url }
Headers: Content-Type: application/json
```

Example:

- Input: `https://open.spotify.com/track/4cOdK2wG6K7H5o1K7g3G3G`
- Request: `POST https://spotifydown.com/download` with body `{"url":"https://open.spotify.com/track/4cOdK2wG6K7H5o1K7g3G3G"}`

**Backup:** `spotifydl.com`

```
GET https://spotifydl.com/api/download?url={url}
```

Example:

- Input: `https://open.spotify.com/track/4cOdK2wG6K7H5o1K7g3G3G`
- Request: `GET https://spotifydl.com/api/download?url=https://open.spotify.com/track/4cOdK2wG6K7H5o1K7g3G3G`

### Instagram

**Primary:** `saveig.app`

```
POST https://saveig.app/api/download
Body: { url: ig_url }
Headers: Content-Type: application/json
```

Example:

- Input: `https://www.instagram.com/reel/ABC123/`
- Request: `POST https://saveig.app/api/download` with body `{"url":"https://www.instagram.com/reel/ABC123/"}`

**Backup:** `snapinsta.app`

```
POST https://snapinsta.app/api/download
Body: { url: ig_url }
```

Example:

- Input: `https://www.instagram.com/p/XYZ789/`
- Request: `POST https://snapinsta.app/api/download` with body `{"url":"https://www.instagram.com/p/XYZ789/"}`

### SoundCloud (search + download)

**Primary:** SoundCloud API v2 (public, no auth)

```
GET https://api-v2.soundcloud.com/search/tracks?q={query}&client_id={client_id}
```

Client ID extracted from `https://soundcloud.com` JavaScript bundle.

Example:

- Input (search): `lofi hip hop`
- Request: `GET https://api-v2.soundcloud.com/search/tracks?q=lofi+hip+hop&client_id=abc123`
- Input (download): track URL from search result, e.g. `https://soundcloud.com/user/track-name`
- Stream URL from API response `media.transcodings[].url`

### Pinterest (search)

**Primary:** Pinterest Resource API (internal)

```
GET https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q={query}&data={"options":{"query":"{query}"},"context":{}}
```

Example:

- Input (search): `anime wallpaper`
- Request: `GET https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q=anime+wallpaper&data={"options":{"query":"anime+wallpaper"},"context":{}}`

### Pinterest (download)

**Primary:** `pinterestdownloader.com`

```
POST https://pinterestdownloader.com/download
Body: { url: pin_url }
```

Example:

- Input: `https://www.pinterest.com/pin/123456789/`
- Request: `POST https://pinterestdownloader.com/download` with body `{"url":"https://www.pinterest.com/pin/123456789/"}`

### Genius / Lyrics

**Primary:** Genius public API

```
GET https://genius.com/api/search/multi?q={query}
```

Returns JSON directly, no HTML scraping needed.

Example:

- Input: `Bohemian Rhapsody`
- Request: `GET https://genius.com/api/search/multi?q=Bohemian+Rhapsody`
- Response contains `response.sections[].hits[].result.url` pointing to lyrics page

### MediaFire

**Primary:** Direct scrape `mediafire.com`

```
GET https://www.mediafire.com/file/{id}/{filename}/file
```

Parse download link from HTML using cheerio.

Example:

- Input: `https://www.mediafire.com/file/abc123/myfile.pdf/file`
- Request: `GET https://www.mediafire.com/file/abc123/myfile.pdf/file`
- Parse `<a id="downloadButton"` href attribute from response HTML

### Threads

**Primary:** `savefrom.net`

```
POST https://savefrom.net/savefrom.php
Body: { url: threads_url }
```

Example:

- Input: `https://www.threads.net/@user/post/ABC123`
- Request: `POST https://savefrom.net/savefrom.php` with body `{"url":"https://www.threads.net/@user/post/ABC123"}`

**Backup:** Threads GraphQL API

```
POST https://www.threads.net/api/graphql
Body: { doc_id: "...", variables: { shortcode: "..." } }
```

Example:

- Input: `https://www.threads.net/@user/post/ABC123`
- shortcode: `ABC123`
- Request: `POST https://www.threads.net/api/graphql` with body `{"doc_id":"...","variables":{"shortcode":"ABC123"}}`

### X / Twitter

**Primary:** `savetwitter.net`

```
POST https://savetwitter.net/api/download
Body: { url: tweet_url }
```

Example:

- Input: `https://x.com/user/status/1234567890`
- Request: `POST https://savetwitter.net/api/download` with body `{"url":"https://x.com/user/status/1234567890"}`

**Backup:** `fxtwitter.com` (fixes Twitter embeds)

```
GET https://api.fxtwitter.com/status/{tweet_id}
```

Returns JSON directly.

Example:

- Input: `https://twitter.com/user/status/1234567890`
- tweet_id: `1234567890`
- Request: `GET https://api.fxtwitter.com/status/1234567890`
- Response contains `tweet.media.videos[].url`

### Screenshot Web

**Primary:** `pageshot.site` (free, no key)

```
GET https://pageshot.site/api?url={url}&width=1280&height=720&format=png
```

Example:

- Input: `https://google.com`
- Request: `GET https://pageshot.site/api?url=https://google.com&width=1280&height=720&format=png`
- Response: PNG image binary

**Backup:** `webshot.site`

```
GET https://webshot.site/api?url={url}&format=png
```

Example:

- Input: `https://github.com`
- Request: `GET https://webshot.site/api?url=https://github.com&format=png`
- Response: PNG image binary

## File Structure

```
src/infra/scrapers/
├── index.ts           # Re-export all scrapers
├── youtube.ts         # ytmp3, ytmp4
├── spotify.ts         # spotify download
├── instagram.ts       # igdl
├── soundcloud.ts      # soundcloud search + download
├── pinterest.ts       # pinterest search + download
├── genius.ts          # lyrics search
├── mediafire.ts       # mediafire download
├── threads.ts         # threadsdl
├── twitter.ts         # xdl
├── ssweb.ts           # screenshot web
```

## Scraper Pattern

```ts
// src/infra/scrapers/youtube.ts
import axios from "axios";
import * as cheerio from "cheerio";

const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 ...";

interface DownloadResult {
  url: string;
  quality?: string;
  type: "audio" | "video";
  filename?: string;
}

export async function downloadYouTubeVideo(
  url: string,
): Promise<DownloadResult[]> {
  // 1. POST to target website
  const { data } = await axios.post(
    "https://www.y2mate.com/mates/analyzeV2/ajax",
    new URLSearchParams({
      k_query: url,
      k_page: "home",
      hl: "en",
      q_auto: "0",
    }),
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": UA,
      },
    },
  );

  // 2. Parse response (JSON or HTML)
  const $ = cheerio.load(data.result);
  // ... extract download links

  // 3. Return typed result
  return [{ url: downloadLink, type: "video" }];
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
