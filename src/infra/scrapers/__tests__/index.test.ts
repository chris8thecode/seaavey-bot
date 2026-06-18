import { describe, expect, it } from "bun:test";
import { scraperError, scraperSuccess } from "../index";

describe("scraperSuccess", () => {
  it("should return status true with data", () => {
    const result = scraperSuccess({ name: "test" });

    expect(result.status).toBe(true);
    expect(result.data).toEqual({ name: "test" });
    expect(result.error).toBeUndefined();
  });

  it("should return status true with array data", () => {
    const result = scraperSuccess([1, 2, 3]);

    expect(result.status).toBe(true);
    expect(result.data).toEqual([1, 2, 3]);
  });
});

describe("scraperError", () => {
  it("should return status false with error message", () => {
    const result = scraperError("Something went wrong");

    expect(result.status).toBe(false);
    expect(result.error).toBe("Something went wrong");
    expect(result.data).toEqual([]);
  });
});
