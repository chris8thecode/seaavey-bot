import { describe, expect, it } from "bun:test";
import { ytmp3, ytmp4 } from "../youtube";

describe("youtube downloader", () => {
  it("should download video as mp4", async () => {
    const result = await ytmp4("https://www.youtube.com/watch?v=kJQP7kiw5Fk");

    expect(result.status).toBe(true);
    expect(result.data).toHaveProperty("title");
    expect(result.data).toHaveProperty("downloadUrl");
    expect(result.data).toHaveProperty("format");
    expect(result.data.title.length).toBeGreaterThan(0);
    expect(result.data.downloadUrl.length).toBeGreaterThan(0);
  }, 120000);

  it("should download audio as mp3", async () => {
    const result = await ytmp3("https://www.youtube.com/watch?v=kJQP7kiw5Fk");

    expect(result.status).toBe(true);
    expect(result.data).toHaveProperty("title");
    expect(result.data).toHaveProperty("downloadUrl");
    expect(result.data.title.length).toBeGreaterThan(0);
    expect(result.data.downloadUrl.length).toBeGreaterThan(0);
  }, 120000);

  it("should handle invalid URL", async () => {
    const result = await ytmp4("https://invalid-url.com/video");

    expect(result.status).toBe(false);
    expect(result.error).toBeDefined();
  }, 30000);
});
