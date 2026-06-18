import axios from "axios";

import type { ScraperResult } from "./index";
import { scraperError, scraperSuccess } from "./index";

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

export interface PinterestPin {
  id: string;
  title: string;
  image: string;
  url: string;
}

/**
 * Convert any Pinterest thumbnail URL to original resolution.
 * e.g. i.pinimg.com/60x60/... → i.pinimg.com/originals/...
 */
function toOriginal(url: string): string {
  return url
    .replace("i.pinimg.com/60x60/", "i.pinimg.com/originals/")
    .replace("i.pinimg.com/736x/", "i.pinimg.com/originals/")
    .replace("i.pinimg.com/564x/", "i.pinimg.com/originals/");
}

/**
 * Search Pinterest pins by query.
 */
export async function pinterestSearch(
  query: string,
  limit = 5,
): Promise<ScraperResult<PinterestPin[]>> {
  try {
    const { data: html } = await axios.get(
      `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "user-agent": UA,
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        timeout: 15_000,
        responseType: "text",
      },
    );

    const results: PinterestPin[] = [];

    // Extract 736x thumbnail URLs (search result grid)
    const thumbRe = /i\.pinimg\.com\/736x\/[a-f0-9/]+\.\w+/g;
    const altRe = /alt="([^"]{3,200})"/g;
    const pinRe = /\/pin\/(\d+)\//g;

    const thumbs = Array.from(new Set([...html.matchAll(thumbRe)].map((m) => m[0])));
    const alts = [...html.matchAll(altRe)].map((m) => m[1]);
    const pinIds = Array.from(new Set([...html.matchAll(pinRe)].map((m) => m[1])));

    const count = Math.min(thumbs.length, limit);
    for (let i = 0; i < count; i++) {
      const imageUrl = `https://${thumbs[i]}`;
      const pinId = pinIds[i] || "";
      const title = alts[i] || "";

      results.push({
        id: pinId,
        title,
        image: toOriginal(imageUrl),
        url: pinId ? `https://www.pinterest.com/pin/${pinId}/` : imageUrl,
      });
    }

    if (!results.length) throw new Error("Tidak ditemukan");
    return scraperSuccess(results);
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Unknown error");
  }
}

/**
 * Get full-size image from a Pinterest pin URL.
 * Supports: https://www.pinterest.com/pin/12345/
 *           https://pin.it/abc
 */
export async function pinterestDl(url: string): Promise<ScraperResult<PinterestPin>> {
  try {
    // Resolve short URLs (pin.it) — follow redirect chain to extract pin ID
    let resolvedUrl = url;
    if (url.includes("pin.it")) {
      let current = url;
      for (let i = 0; i < 10; i++) {
        const resp = await axios.get(current, {
          headers: { "user-agent": UA },
          maxRedirects: 0,
          validateStatus: (s) => s < 400,
          timeout: 10_000,
        });
        const loc = resp.headers.location;
        if (!loc) break;
        const idFromRedirect = loc.match(/\/pin\/(\d+)/);
        if (idFromRedirect) {
          resolvedUrl = `https://www.pinterest.com/pin/${idFromRedirect[1]}/`;
          break;
        }
        current = loc.startsWith("http") ? loc : new URL(loc, current).href;
      }
    }

    const { data: html } = await axios.get(resolvedUrl, {
      headers: {
        "user-agent": UA,
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15_000,
      responseType: "text",
    });

    // Extract original image
    const origMatch = html.match(/i\.pinimg\.com\/originals\/[a-f0-9/]+\.\w+/);
    // Fallback: 736x
    const largeMatch = html.match(/i\.pinimg\.com\/736x\/[a-f0-9/]+\.\w+/);
    // Alt text from og:image or first alt attribute
    const ogDesc = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    const altMatch = html.match(/alt="([^"]{3,300})"/);
    // Pin ID from URL
    const idMatch = resolvedUrl.match(/\/pin\/(\d+)/);

    const imageUrl = origMatch
      ? `https://${origMatch[0]}`
      : largeMatch
        ? `https://${toOriginal(largeMatch[0])}`
        : "";

    if (!imageUrl) throw new Error("Gambar tidak ditemukan");

    const title = (altMatch && altMatch[1]) || (ogDesc && ogDesc[1]) || "";

    return scraperSuccess({
      id: idMatch?.[1] || "",
      title,
      image: imageUrl,
      url: resolvedUrl,
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Unknown error");
  }
}
