import axios from "axios";

import type { ScraperResult } from "./index";
import { scraperError, scraperSuccess } from "./index";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const HEADERS = {
  "user-agent": UA,
  referer: "https://www.pixiv.net/",
};

// ─── Types ──────────────────────────────────────────────────────────────

export interface PixivIllust {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  tags: string[];
  pageCount: number;
  likeCount: number;
  viewCount: number;
  urls: {
    mini: string;
    thumb: string;
    small: string;
    regular: string;
    original: string;
  };
}

export interface PixivSearchResult {
  total: number;
  illustrations: PixivIllust[];
}

export interface PixivPage {
  thumbMini: string;
  small: string;
  regular: string;
  original: string;
}

export interface PixivRankingItem {
  rank: number;
  id: string;
  title: string;
  author: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  url: string;
  width: number;
  height: number;
}

export type PixivRankingMode =
  | "daily"
  | "weekly"
  | "monthly"
  | "male"
  | "female"
  | "daily_r18"
  | "weekly_r18"
  | "male_r18"
  | "female_r18"
  | "r18g";

interface PixivTag {
  tag: string;
  tagName: string;
}

interface PixivIllustResponse {
  id: number | string;
  title: string;
  description: string;
  userName: string;
  userId: number | string;
  tags: { tags: PixivTag[] };
  pageCount: number;
  likeCount: number;
  viewCount: number;
  urls: {
    mini: string;
    thumb: string;
    small: string;
    regular: string;
    original: string;
  };
}

interface PixivPageResponse {
  urls: {
    thumb_mini: string;
    small: string;
    regular: string;
    original: string;
  };
}

interface PixivRankingResponse {
  rank: number;
  illust_id: number;
  title: string;
  user_name: string;
  tags: string[];
  view_count: number;
  rating_count: number;
  url: string;
  width: number;
  height: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function extractId(urlOrId: string): string {
  const match = urlOrId.match(/(?:artworks|illust_id=)(\d+)/);
  if (match) return match[1];
  if (/^\d+$/.test(urlOrId)) return urlOrId;
  throw new Error("URL atau ID tidak valid");
}

function mapIllust(data: PixivIllustResponse): PixivIllust {
  return {
    id: String(data.id),
    title: data.title || "",
    description: data.description || "",
    author: data.userName || "",
    authorId: String(data.userId || ""),
    tags: data.tags?.tags?.map((t) => t.tag) || [],
    pageCount: data.pageCount || 1,
    likeCount: data.likeCount || 0,
    viewCount: data.viewCount || 0,
    urls: {
      mini: data.urls?.mini || "",
      thumb: data.urls?.thumb || "",
      small: data.urls?.small || "",
      regular: data.urls?.regular || "",
      original: data.urls?.original || "",
    },
  };
}

// ─── Search ──────────────────────────────────────────────────────────────

export async function pixivSearch(
  keyword: string,
  opts: {
    page?: number;
    mode?: "all" | "safe" | "rough" | "very_rough";
    order?: "date_d" | "date" | "popular_d";
    type?: "illust" | "manga" | "all";
  } = {},
): Promise<ScraperResult<PixivSearchResult>> {
  try {
    const params = new URLSearchParams({
      word: keyword,
      order: opts.order || "date_d",
      mode: opts.mode || "all",
      p: String(opts.page || 1),
      s_mode: "s_tag",
      type: opts.type || "all",
      lang: "en",
    });

    const { data } = await axios.get(
      `https://www.pixiv.net/ajax/search/artworks/${encodeURIComponent(keyword)}?${params}`,
      { headers: HEADERS, timeout: 15_000 },
    );

    if (data.error) {
      throw new Error(data.message || "Gagal search di Pixiv");
    }

    const illusts = data.body?.illustManga?.data || [];
    const total = data.body?.illustManga?.total || 0;

    return scraperSuccess({
      total,
      illustrations: illusts.map(mapIllust),
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Unknown error");
  }
}

// ─── Detail ──────────────────────────────────────────────────────────────

export async function pixivDetail(
  urlOrId: string,
): Promise<ScraperResult<PixivIllust>> {
  try {
    const id = extractId(urlOrId);

    const { data } = await axios.get(
      `https://www.pixiv.net/ajax/illust/${id}?lang=en`,
      { headers: HEADERS, timeout: 15_000 },
    );

    if (data.error) {
      throw new Error(data.message || "Illustration tidak ditemukan");
    }

    return scraperSuccess(mapIllust(data.body));
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Unknown error");
  }
}

// ─── Pages (multi-page) ─────────────────────────────────────────────────

export async function pixivPages(
  urlOrId: string,
): Promise<ScraperResult<PixivPage[]>> {
  try {
    const id = extractId(urlOrId);

    const { data } = await axios.get(
      `https://www.pixiv.net/ajax/illust/${id}/pages?lang=en`,
      { headers: HEADERS, timeout: 15_000 },
    );

    if (data.error) {
      throw new Error(data.message || "Gagal mengambil halaman");
    }

    const pages: PixivPage[] = (data.body || []).map((p: PixivPageResponse) => ({
      thumbMini: p.urls?.thumb_mini || "",
      small: p.urls?.small || "",
      regular: p.urls?.regular || "",
      original: p.urls?.original || "",
    }));

    return scraperSuccess(pages);
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Unknown error");
  }
}

// ─── Ranking ─────────────────────────────────────────────────────────────

export async function pixivRanking(
  opts: {
    mode?: PixivRankingMode;
    content?: "illust" | "manga";
    page?: number;
  } = {},
): Promise<ScraperResult<PixivRankingItem[]>> {
  try {
    const params = new URLSearchParams({
      mode: opts.mode || "daily",
      content: opts.content || "illust",
      p: String(opts.page || 1),
      format: "json",
      lang: "en",
    });

    const { data } = await axios.get(
      `https://www.pixiv.net/ranking.php?${params}`,
      { headers: HEADERS, timeout: 15_000 },
    );

    if (!data.contents) {
      throw new Error("Gagal mengambil ranking");
    }

    const items: PixivRankingItem[] = data.contents.map((c: PixivRankingResponse) => ({
      rank: c.rank,
      id: String(c.illust_id),
      title: c.title,
      author: c.user_name,
      tags: c.tags || [],
      viewCount: c.view_count || 0,
      likeCount: c.rating_count || 0,
      url: c.url || "",
      width: c.width || 0,
      height: c.height || 0,
    }));

    return scraperSuccess(items);
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Unknown error");
  }
}

// ─── Download helper ─────────────────────────────────────────────────────

export async function pixivDownloadImage(
  url: string,
): Promise<ScraperResult<Buffer>> {
  try {
    const { data } = await axios.get(url, {
      headers: { ...HEADERS, referer: "https://www.pixiv.net/" },
      responseType: "arraybuffer",
      timeout: 30_000,
    });

    return scraperSuccess(Buffer.from(data));
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Gagal download gambar");
  }
}
