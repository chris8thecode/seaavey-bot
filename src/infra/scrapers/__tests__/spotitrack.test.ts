import { describe, expect, it } from "bun:test";
import { spotitrackTrack, spotitrackPlaylist } from "../spotitrack";

const TRACK_URL = "https://open.spotify.com/track/1fDFHXcykq4iw8Gg7s5hG9";
const PLAYLIST_URL = "https://open.spotify.com/playlist/45DwXpZc4Hfcp6x71Z5Mo7";

describe("spotitrackTrack", () => {
  it(
    "should download track from spotitrack",
    async () => {
      const res = await spotitrackTrack(TRACK_URL);

      expect(res.status).toBe(true);
      expect(res.data.title).toBeString();
      expect(res.data.title.length).toBeGreaterThan(0);
      expect(res.data.artist).toBeString();
      expect(res.data.fileSize).toBeString();
      expect(res.data.buffer).toBeInstanceOf(Buffer);
      expect(res.data.buffer.length).toBeGreaterThan(0);
    },
    { timeout: 120000 },
  );
});

describe("spotitrackPlaylist", () => {
  it(
    "should get playlist download URL",
    async () => {
      const res = await spotitrackPlaylist(PLAYLIST_URL);

      expect(res.status).toBe(true);
      expect(res.data.title).toBeString();
      expect(res.data.trackCount).toBeNumber();
      expect(res.data.downloadUrl).toBeString();
      expect(res.data.downloadUrl.startsWith("https://")).toBe(true);
    },
    { timeout: 120000 },
  );
});
