import { describe, expect, it } from "bun:test";
import { soundcloudDl, soundcloudSearch } from "../soundcloud";

describe("soundcloud", () => {
  it("should search tracks by query", async () => {
    const result = await soundcloudSearch("Faded Alan Walker", 3);

    expect(result.status).toBe(true);
    expect(result.data).toHaveProperty("query");
    expect(result.data).toHaveProperty("total");
    expect(result.data).toHaveProperty("tracks");
    expect(result.data.tracks.length).toBeGreaterThan(0);
    expect(result.data.tracks[0]).toHaveProperty("id");
    expect(result.data.tracks[0]).toHaveProperty("title");
    expect(result.data.tracks[0]).toHaveProperty("artist");
    expect(result.data.tracks[0]).toHaveProperty("streamUrl");
  }, 15000);

  it("should download track from URL", async () => {
    const result = await soundcloudDl("https://soundcloud.com/alanwalker/faded-slushii-remix-1");

    expect(result.status).toBe(true);
    expect(result.data).toHaveProperty("id");
    expect(result.data).toHaveProperty("title");
    expect(result.data).toHaveProperty("artist");
    expect(result.data).toHaveProperty("streamUrl");
    expect(result.data.streamUrl.length).toBeGreaterThan(0);
  }, 15000);
});
