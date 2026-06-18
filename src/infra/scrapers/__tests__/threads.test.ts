import { describe, expect, it } from "bun:test";
import { threadsDl } from "../threads";

describe("threads downloader", () => {
  it("should return media from Threads post URL", async () => {
    const result = await threadsDl(
      "https://www.threads.com/@sarleosly/post/DZe6YDsCRSQ?xmt=AQG0JCVLcDYEeDtTpymbTfpBAwnk_DoukdrM4GidsOommw",
    );

    expect(result.status).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toHaveProperty("index");
    expect(result.data[0]).toHaveProperty("type");
    expect(result.data[0]).toHaveProperty("url");
  });

  it("should handle invalid URL", async () => {
    const result = await threadsDl("https://invalid-url.com/post");

    expect(result.status).toBe(false);
    expect(result.error).toBeDefined();
  });
});
