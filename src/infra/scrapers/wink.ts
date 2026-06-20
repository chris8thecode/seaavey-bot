import axios from "axios";
import * as crypto from "node:crypto";
import * as fs from "node:fs";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FormData = require("form-data");

import type { ScraperResult } from "./index";
import { scraperError, scraperSuccess } from "./index";

const BASE_URL = "https://wink.ai";
const STRATEGY_URL = "https://strategy.app.meitudata.com";

const CLIENT_ID = "1189857605";
const VERSION = "5.1.2";
const COUNTRY_CODE = "ID";
const CLIENT_LANGUAGE = "en_US";
const CLIENT_TIMEZONE = "Asia/Jakarta";

const TASK_TYPE = "11";
const CONTENT_TYPE = "2";

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

export interface WinkData {
  resultUrl: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeTrace() {
  return `${crypto.randomBytes(16).toString("hex")}-${crypto.randomBytes(8).toString("hex")}-1`;
}

function traceHeaders() {
  const trace = makeTrace();
  return {
    "sentry-trace": trace,
    baggage: [
      "sentry-environment=release",
      `sentry-release=${VERSION}%20(b60d25c477f43c6dfac4107810f26d442320f4f1)`,
      "sentry-public_key=e1bf914f3448d9bc8a10c7e499d17d54",
      `sentry-trace_id=${trace.split("-")[0]}`,
      "sentry-sampled=true",
      "sentry-sample_rate=0.75",
    ].join(","),
  };
}

function baseParams(extra: Record<string, string> = {}) {
  return new URLSearchParams({
    client_id: CLIENT_ID,
    version: VERSION,
    country_code: COUNTRY_CODE,
    gnum: crypto.randomUUID(),
    client_language: CLIENT_LANGUAGE,
    client_channel_id: "",
    client_timezone: CLIENT_TIMEZONE,
    ...extra,
  });
}

function extToMime(file: string) {
  const ext = file.split(".").pop()?.toLowerCase();
  if (ext === "mp4") return "video/mp4";
  if (ext === "mov") return "video/quicktime";
  if (ext === "webm") return "video/webm";
  return "application/octet-stream";
}

// ─── API Steps ──────────────────────────────────────────────────────

async function getMaatSign() {
  const params = baseParams({ suffix: ".mp4", type: "temp", count: "1" });
  const res = await axios.get(`${BASE_URL}/api/file/get_maat_sign.json?${params}`, {
    headers: { "user-agent": UA, ...traceHeaders() },
    validateStatus: () => true,
  });

  if (res.status >= 400 || res.data?.code !== 0) {
    throw new Error(`get_maat_sign gagal: ${JSON.stringify(res.data)}`);
  }
  return res.data.data as Record<string, string>;
}

async function getUploadPolicy(sign: Record<string, string>) {
  const params = new URLSearchParams({
    app: sign.app || "",
    count: String(sign.count),
    sig: sign.sig || "",
    sigTime: sign.sig_time || "",
    sigVersion: sign.sig_version || "",
    suffix: sign.suffix || "",
    type: sign.type || "",
  });

  const res = await axios.get(`${STRATEGY_URL}/upload/policy?${params}`, {
    headers: { "user-agent": UA, origin: BASE_URL, referer: `${BASE_URL}/` },
    validateStatus: () => true,
  });

  if (res.status >= 400 || !Array.isArray(res.data) || !res.data[0]?.qiniu) {
    throw new Error(`upload policy gagal: ${JSON.stringify(res.data)}`);
  }
  return res.data[0].qiniu;
}

async function uploadToQiniu(policy: Record<string, string>, filePath: string) {
  const form = new FormData.default();
  form.append("file", fs.createReadStream(filePath), {
    filename: filePath.split("/").pop() || "video.mp4",
    contentType: extToMime(filePath),
  });
  form.append("token", policy.token);
  form.append("key", policy.key);
  form.append("fname", filePath.split("/").pop() || "video.mp4");

  const res = await axios.post(policy.url || "", form, {
    headers: form.getHeaders({
      origin: BASE_URL,
      referer: `${BASE_URL}/`,
      "user-agent": UA,
    }),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true,
  });

  if (res.status >= 400) {
    throw new Error(`upload qiniu gagal HTTP ${res.status}`);
  }
  if (!res.data?.url && !res.data?.data) {
    throw new Error("upload qiniu response tidak valid");
  }

  return {
    fileKey: policy.key || "",
    sourceUrl: res.data.url || res.data.data || policy.data || "",
  };
}

async function startTranscode(fileKey: string) {
  const body = baseParams({ file_key: fileKey });
  const res = await axios.post(`${BASE_URL}/api/file/video_trans_start.json`, body.toString(), {
    headers: {
      "user-agent": UA,
      ...traceHeaders(),
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    validateStatus: () => true,
  });

  if (res.status >= 400 || res.data?.code !== 0 || !res.data?.data?.id) {
    throw new Error(`transcode start gagal: ${JSON.stringify(res.data)}`);
  }
  return res.data.data.id;
}

async function queryTranscode(id: string) {
  const params = baseParams({ id });
  const res = await axios.get(`${BASE_URL}/api/file/video_trans_query.json?${params}`, {
    headers: { "user-agent": UA, ...traceHeaders() },
    validateStatus: () => true,
  });

  if (res.status >= 400 || res.data?.code !== 0) {
    throw new Error(`transcode query gagal: ${JSON.stringify(res.data)}`);
  }
  return res.data.data;
}

async function waitTranscode(id: string, fallbackSourceUrl: string, maxTry = 80, delayMs = 3000) {
  for (let i = 1; i <= maxTry; i++) {
    const data = await queryTranscode(id);

    const videoTranscoded =
      data?.video_transcoded ||
      data?.transcoded_video ||
      data?.transcoded_url ||
      data?.video_url ||
      "";

    if (videoTranscoded) {
      return {
        sourceUrl: data?.video || data?.url || data?.source_url || fallbackSourceUrl,
        videoTranscoded,
      };
    }
    await sleep(delayMs);
  }
  return { sourceUrl: fallbackSourceUrl, videoTranscoded: fallbackSourceUrl };
}

async function delivery(sourceUrl: string, videoTranscoded: string, taskName: string) {
  const body = baseParams({
    type: TASK_TYPE,
    content_type: CONTENT_TYPE,
    source_url: sourceUrl,
    type_params: JSON.stringify({
      is_mirror: 0,
      orientation_tag: 1,
      j_420_trans: "1",
      return_ext: "2",
    }),
    right_detail: JSON.stringify({
      source: "1",
      touch_type: "4",
      function_id: "630",
      material_id: "63011",
      url: `${BASE_URL}/video-enhancer/upload`,
    }),
    ext_params: JSON.stringify({
      task_name: taskName,
      records: TASK_TYPE,
      video_transcoded: videoTranscoded,
    }),
    with_prepare: "1",
  });

  const res = await axios.post(`${BASE_URL}/api/meitu_ai/delivery.json`, body.toString(), {
    headers: {
      "user-agent": UA,
      ...traceHeaders(),
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    validateStatus: () => true,
  });

  if (res.status >= 400 || res.data?.code !== 0) {
    throw new Error(`delivery gagal: ${JSON.stringify(res.data)}`);
  }

  const data = res.data.data || {};
  return {
    msgId: data.msg_id || data.prepare_msg_id || "",
    raw: data,
  };
}

async function queryBatch(msgId: string) {
  const params = baseParams({ msg_ids: msgId });
  const res = await axios.get(`${BASE_URL}/api/meitu_ai/query_batch.json?${params}`, {
    headers: { "user-agent": UA, ...traceHeaders(), referer: `${BASE_URL}/video-enhancer/upload` },
    validateStatus: () => true,
  });

  if (res.status >= 400 || res.data?.code !== 0) {
    throw new Error(`query batch gagal: ${JSON.stringify(res.data)}`);
  }
  return res.data.data;
}

function extractResultUrl(data: Record<string, unknown>) {
  const itemList = data?.item_list as Record<string, unknown>[] | undefined;
  const item = itemList?.[0];
  const result = item?.result as Record<string, unknown> | undefined;
  const mediaList = result?.media_info_list as Record<string, unknown>[] | undefined;
  const media = mediaList?.[0];
  const extParams = item?.client_ext_params as Record<string, unknown> | undefined;
  return (
    media?.media_data || result?.result_url || result?.url || extParams?.video_transcoded || ""
  );
}
function extractNextMsgId(data: Record<string, unknown>, currentMsgId: string) {
  const itemList = data?.item_list as Record<string, unknown>[] | undefined;
  const item = itemList?.[0];
  const result = item?.result as Record<string, unknown> | undefined;
  const resultValue = (result?.result as string) || "";
  const realMsgId = (result?.msg_id as string) || (item?.msg_id as string) || "";

  if (resultValue && resultValue !== currentMsgId && !resultValue.startsWith("http")) {
    return resultValue;
  }
  if (realMsgId && realMsgId !== currentMsgId && !realMsgId.startsWith("wpr_")) {
    return realMsgId;
  }
  return "";
}

async function waitResult(firstMsgId: string, maxTry = 120, delayMs = 5000) {
  let msgId = firstMsgId;
  for (let i = 1; i <= maxTry; i++) {
    const data = await queryBatch(msgId);

    const nextMsgId = extractNextMsgId(data, msgId);
    if (nextMsgId) {
      msgId = nextMsgId;
      await sleep(1000);
      continue;
    }

    const url = extractResultUrl(data);
    const errorCode = data?.item_list?.[0]?.result?.error_code;
    if (url && typeof url === "string" && url.startsWith("http") && errorCode === 0) {
      return url;
    }

    if (errorCode && errorCode !== 29901 && errorCode !== 0) {
      throw new Error(`task gagal: ${errorCode}`);
    }
    await sleep(delayMs);
  }
  throw new Error("result belum selesai");
}

// ─── Main ───────────────────────────────────────────────────────────

export async function winkEnhance(filePath: string): Promise<ScraperResult<WinkData>> {
  try {
    if (!fs.existsSync(filePath)) {
      return scraperError(`File tidak ditemukan: ${filePath}`);
    }

    const fileName = filePath.split("/").pop() || "video.mp4";
    const taskName = `Enhancer-Ultra HD-${fileName.replace(/\.[^.]+$/, "")}`;

    const sign = await getMaatSign();
    const policy = await getUploadPolicy(sign);
    const uploaded = await uploadToQiniu(policy, filePath);

    const transcodeId = await startTranscode(uploaded.fileKey);
    const transcode = await waitTranscode(transcodeId, uploaded.sourceUrl);

    const task = await delivery(transcode.sourceUrl, transcode.videoTranscoded, taskName);

    if (!task.msgId) {
      return scraperError("delivery tidak mengembalikan msg_id");
    }

    const resultUrl = await waitResult(task.msgId);
    return scraperSuccess({ resultUrl });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Unknown error");
  }
}
