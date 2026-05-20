import { defineCommand } from "@/core/types";
import { api } from "@/infra/api";

export default defineCommand({
  name: "MediaFire",
  alias: ["mf"],
  description: "Download file dari Mediafire",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url)
      return msg.reply("Kirim URL Mediafire.\nContoh: .mediafire https://mediafire.com/file/...");
    await msg.reply("⏳ Downloading...");
    const res = await api.get<{ filename: string; url: string; size: string }>(
      `/downloader/mediafire?url=${encodeURIComponent(url)}`,
    );
    await msg.send({
      document: { url: res.data.url },
      mimetype: "application/octet-stream",
      fileName: res.data.filename,
    });
  },
});
