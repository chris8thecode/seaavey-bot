import { describe, expect, it } from "bun:test";
import { spotify, spotifySearch } from "../spotify";

describe("spotify", () => {
  it("should return track info from URL", async () => {
    const result = await spotify("https://open.spotify.com/track/1fDFHXcykq4iw8Gg7s5hG9");

    expect(result.status).toBe(true);
    expect(result.data).toHaveProperty("title");
    expect(result.data).toHaveProperty("artist");
    expect(result.data).toHaveProperty("downloadUrl");
    expect(result.data.title.length).toBeGreaterThan(0);
  }, 30000);

  it("should return error for invalid URL", async () => {
    const result = await spotify("https://invalid-url.com/track");

    expect(result.status).toBe(false);
    expect(result.error).toBeDefined();
  }, 30000);
});

describe("spotifySearch", () => {
  it("should search tracks by query", async () => {
    const result = await spotifySearch("Faded Alan Walker", 3);

    expect(result.status).toBe(true);
    expect(result.data).toHaveProperty("query");
    expect(result.data).toHaveProperty("total");
    expect(result.data).toHaveProperty("tracks");
    expect(result.data.tracks.length).toBeGreaterThan(0);
    expect(result.data.tracks[0]).toHaveProperty("title");
    expect(result.data.tracks[0]).toHaveProperty("artist");
    expect(result.data.tracks[0]).toHaveProperty("url");
  }, 30000);

  it("should handle limit parameter", async () => {
    const result = await spotifySearch("Alan Walker", 2);

    expect(result.status).toBe(true);
    expect(result.data.tracks.length).toBeLessThanOrEqual(2);
  }, 30000);
});
