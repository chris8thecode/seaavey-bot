import axios from "axios";

import type { ScraperResult } from "./index";
import { scraperError, scraperSuccess } from "./index";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export interface YouTubeData {
  title: string;
  thumbnail: string;
  downloadUrl: string;
  format: string;
}

export async function ytmp3(url: string): Promise<ScraperResult<YouTubeData>> {
  return youtubeDl(url, "mp3");
}

export async function ytmp4(url: string): Promise<ScraperResult<YouTubeData>> {
  return youtubeDl(url, "720");
}

async function youtubeDl(
  url: string,
  format: string,
): Promise<ScraperResult<YouTubeData>> {
  try {
    const startRes = await axios.get(
      "https://loader.to/ajax/download.php",
      {
        params: { format, url },
        headers: {
          "user-agent": UA,
          "x-requested-with": "XMLHttpRequest",
        },
        timeout: 15000,
      },
    );

    const start = startRes.data as {
      success?: boolean;
      id?: string;
      progress_url?: string;
      title?: string;
      info?: { image?: string };
      message?: string;
    };

    if (!start.success || !start.id || !start.progress_url) {
      throw new Error(start.message || "Gagal memulai download");
    }

    const progressUrl = start.progress_url;
    const title = start.title || "Unknown";
    const thumbnail = start.info?.image || "";

    let downloadUrl = "";
    let formatLabel = "";
    const maxAttempts = 60;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 2000));

      const progRes = await axios.get(progressUrl, {
        headers: { "user-agent": UA },
        timeout: 10000,
      });

      const prog = progRes.data as {
        success?: number;
        progress?: number;
        download_url?: string;
        format?: string;
        text?: string;
      };

      if (prog.progress === 1000 && prog.download_url) {
        downloadUrl = prog.download_url;
        formatLabel = prog.format || "";
        break;
      }

      if (prog.success === 0 && prog.text && prog.text !== "Initialising") {
        throw new Error("Download gagal");
      }
    }

    if (!downloadUrl) {
      throw new Error("Timeout: download tidak selesai");
    }

    return scraperSuccess({
      title,
      thumbnail,
      downloadUrl,
      format: formatLabel,
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Unknown error");
  }
}
