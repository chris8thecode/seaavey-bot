import axios from "axios";

import type { ScraperResult } from "./index";
import { scraperError, scraperSuccess } from "./index";

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

export interface CapCutData {
  title: string;
  author: string;
  video: string;
  thumbnail: string;
}

/**
 * Download CapCut template video.
 * Supports both short URL (https://www.capcut.com/t/xxx)
 * and full URL (https://www.capcut.com/template-detail/xxx).
 */
export async function capcutDl(
  url: string,
): Promise<ScraperResult<CapCutData>> {
  try {
    // Normalize URL — extract template-detail if short URL
    let templateUrl = url;
    if (url.includes("/t/")) {
      // Follow redirect to get the full URL
      const resp = await axios.head(url, {
        headers: { "user-agent": UA },
        maxRedirects: 5,
        timeout: 10_000,
      });
      templateUrl = resp.request?.res?.responseUrl || url;
    }

    // Extract template ID from URL
    const idMatch = templateUrl.match(
      /template-detail\/(\d+)/,
    );
    if (!idMatch) {
      throw new Error("URL CapCut tidak valid. Gunakan link template CapCut.");
    }

    const templateId = idMatch[1];
    const apiUrl = `https://backend1.tioo.eu.org/capcut?url=https://www.capcut.com/template-detail/${templateId}`;

    const { data } = await axios.get(apiUrl, {
      headers: {
        "user-agent": UA,
        origin: "https://btch-downloader.vercel.app",
      },
      timeout: 20_000,
    });

    if (!data.status || !data.originalVideoUrl) {
      throw new Error(
        data.error || "Gagal mengambil data dari CapCut",
      );
    }

    return scraperSuccess({
      title: data.title || "Untitled",
      author: data.authorName || "Unknown",
      video: data.originalVideoUrl,
      thumbnail: data.coverUrl || "",
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Unknown error");
  }
}
