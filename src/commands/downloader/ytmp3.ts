import { readFileSync } from "node:fs";
import { defineCommand } from "@/core/types";
import { ytmp3 } from "@/infra/scrapers";

export default defineCommand({
  name: "YT MP3",
  alias: ["ytmp3"],
  description: "Download audio dari YouTube",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) return msg.reply("Kirim URL YouTube.\nContoh: .ytmp3 https://youtu.be/...");

    await msg.reply("⏳ Downloading audio...");

    const result = await ytmp3(url);

    if (!result.status) {
      return msg.reply(`❌ Gagal: ${result.error || "Tidak ada media ditemukan"}`);
    }

    const { title, thumbnail, downloadUrl, format } = result.data;

    const caption = [`🎵 *${title}*`, format ? `📦 ${format}` : null]
      .filter(Boolean)
      .join("\n");

    if (thumbnail) {
      await msg.send({ image: { url: thumbnail }, caption });
    } else {
      await msg.reply(caption);
    }

    if (downloadUrl) {
      // Use local MP3 file if available, otherwise fallback to URL
      if (result.data.localFile) {
        const audioBuffer = readFileSync(result.data.localFile);
        await msg.send({
          audio: audioBuffer,
          mimetype: "audio/mpeg",
          ptt: false,
        });
      } else {
        await msg.send({ audio: { url: downloadUrl }, mimetype: "audio/mpeg" });
      }
    }
  },
});
