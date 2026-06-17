import axios from "axios";
import * as cheerio from "cheerio";

import { defineCommand } from "@/core/types";

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

export default defineCommand({
  name: "Facebook DL",
  alias: ["facebookdl"],
  description: "Download video dari Facebook via fsaver.net",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) return msg.reply("Kirim URL Facebook.\nContoh: .fbdl https://fb.watch/...");

    await msg.reply("⏳ Downloading...");

    const data = await fsaver(url);

    if (!data.Status) {
      return msg.reply(`❌ Gagal: ${data.Error || "Tidak ada media ditemukan"}`);
    }

    const best = data.Result.at(0);
    if (!best) return msg.reply("❌ Gagal: Tidak ada link download ditemukan.");

    await msg.send({
      video: { url: best.Url },
      caption: data.Metadata.Title || "",
    });
  },
});

async function fsaver(url: string) {
  try {
    const challenge = await axios.post(
      "https://fsaver.net/api/challenge",
      { url },
      {
        headers: {
          accept: "*/*",
          "content-type": "application/json",
          origin: "https://fsaver.net",
          "user-agent": UA,
        },
      },
    );

    const token = challenge.data?.token;
    if (!token) throw new Error("Token tidak ditemukan");

    const page = await axios.post(
      "https://fsaver.net/en/download",
      new URLSearchParams({ url, token }).toString(),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "user-agent": UA,
        },
      },
    );

    const $ = cheerio.load(page.data);

    const result: { Quality: string; Url: string }[] = [];
    $("table tr").each((_, el) => {
      const href = $(el).find("a[download]").attr("href");
      if (!href) return;
      result.push({
        Quality: $(el).find("td").eq(0).text().trim(),
        Url: href,
      });
    });

    const title =
      $(".download__item__profile_pic div")
        .first()
        .clone()
        .children()
        .remove()
        .end()
        .text()
        .trim() || null;

    return {
      Status: result.length > 0,
      Code: 200,
      Input: url,
      Result: result,
      Metadata: {
        Title: title,
        Thumbnail: $(".download__item__profile_pic img").attr("src") || null,
      },
    };
  } catch (e: unknown) {
    const err = e as { response?: { status?: number }; message?: string };
    return {
      Status: false,
      Code: err.response?.status || 500,
      Input: url,
      Result: [],
      Metadata: {},
      Error: err.message || "Unknown error",
    };
  }
}
