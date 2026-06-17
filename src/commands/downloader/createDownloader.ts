import { defineCommand } from "@/core/types";
import { api } from "@/infra/api";

interface DownloaderConfig {
  name: string;
  aliases: string[];
  description: string;
  platform: string;
  helpExample: string;
  endpoint: string;
  mediaType: "audio" | "video" | "image" | "auto";
  progressText?: string;
}

type ApiData = { url: string; title?: string; type?: string };

/**
 * Factory for simple downloader commands that follow the same pattern:
 * validate URL → show progress → call API → send media.
 *
 * Handles audio, video, image, and auto-detect (video/image) media types.
 */
export function createDownloader(cfg: DownloaderConfig) {
  return defineCommand({
    name: cfg.name,
    alias: cfg.aliases,
    description: cfg.description,
    handler: async (_sock, msg) => {
      const url = msg.args[0];
      if (!url) {
        return msg.reply(
          `Kirim URL ${cfg.platform}.\nContoh: ${cfg.aliases[0] ?? "."} ${cfg.helpExample}`,
        );
      }

      await msg.reply(cfg.progressText ?? "⏳ Downloading...");

      const res = await api.get<ApiData>(`${cfg.endpoint}?url=${encodeURIComponent(url)}`);

      const data = res.data;

      switch (cfg.mediaType) {
        case "audio":
          await msg.send({ audio: { url: data.url }, mimetype: "audio/mpeg" });
          break;
        case "video":
          await msg.send({
            video: { url: data.url },
            caption: data.title ?? "",
          });
          break;
        case "image":
          await msg.send({ image: { url: data.url } });
          break;
        case "auto":
          if (data.type === "video") {
            await msg.send({ video: { url: data.url } });
          } else {
            await msg.send({ image: { url: data.url } });
          }
          break;
      }
    },
  });
}
