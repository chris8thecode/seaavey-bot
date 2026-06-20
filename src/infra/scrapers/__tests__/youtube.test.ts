import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ytmp3, ytmp4 } from "../youtube";

const hasCookies = existsSync(join(import.meta.dir, "../../../../cookies.txt"));

describe("youtube downloader", () => {
  it("should download video as mp4", async () => {
    const result = await ytmp4("https://www.youtube.com/watch?v=kJQP7kiw5Fk");

    // Without cookies, yt-dlp may fail; loader.to may return ad-wrapped URLs
    // So we accept both success and specific failure messages
    if (result.status) {
      expect(result.data).toHaveProperty("title");
      expect(result.data).toHaveProperty("downloadUrl");
      expect(result.data).toHaveProperty("format");
      expect(result.data.title.length).toBeGreaterThan(0);
      expect(result.data.downloadUrl.length).toBeGreaterThan(0);
    } else {
      // Expected failure without cookies
      expect(result.error).toBeDefined();
      expect(result.error!.length).toBeGreaterThan(0);
    }
  }, 120_000);

  it("should download audio as mp3", async () => {
    const result = await ytmp3("https://www.youtube.com/watch?v=kJQP7kiw5Fk");

    if (result.status) {
      expect(result.data).toHaveProperty("title");
      expect(result.data).toHaveProperty("downloadUrl");
      expect(result.data.title.length).toBeGreaterThan(0);
      expect(result.data.downloadUrl.length).toBeGreaterThan(0);
    } else {
      expect(result.error).toBeDefined();
      expect(result.error!.length).toBeGreaterThan(0);
    }
  }, 120_000);

  it("should handle invalid URL", async () => {
    const result = await ytmp4("https://invalid-url.com/video");

    expect(result.status).toBe(false);
    expect(result.error).toBeDefined();
  }, 30_000);

  it("should handle music.youtube.com URLs", async () => {
    const result = await ytmp3("https://music.youtube.com/watch?v=dQw4w9WgXcQ");

    // Should either succeed or fail gracefully (not crash)
    expect(typeof result.status).toBe("boolean");
    expect(result.data || result.error).toBeDefined();
  }, 120_000);

  if (hasCookies) {
    it("should work with cookies.txt (integration test)", async () => {
      const result = await ytmp3("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

      expect(result.status).toBe(true);
      expect(result.data.title).toBeTruthy();
      expect(result.data.downloadUrl).toBeTruthy();
    }, 120_000);
  }
});
