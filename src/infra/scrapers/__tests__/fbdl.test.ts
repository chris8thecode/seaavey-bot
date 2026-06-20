import { describe, expect, it } from "bun:test";
import { fsaver } from "../fbdl";

describe("facebook downloader", () => {
  it("should handle Facebook video URL", async () => {
    const result = await fsaver("https://www.facebook.com/watch/?v=762932621316078");

    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("data");
    expect(typeof result.status).toBe("boolean");
    expect(Array.isArray(result.data)).toBe(true);
  }, 15000);

  it("should handle Facebook photo URL", async () => {
    const result = await fsaver("https://www.facebook.com/photo/?fbid=1234567890123456");

    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("data");
    expect(typeof result.status).toBe("boolean");
    expect(Array.isArray(result.data)).toBe(true);
  }, 15000);
});
