import { defineCommand } from "@/core/types";
import { soundcloudDl } from "@/infra/scrapers";

export default defineCommand({
  name: "SoundCloud DL",
  alias: ["scdl", "soundclouddl"],
  description: "Download lagu dari SoundCloud",
  handler: async (_sock, msg) => {
    const url = msg.args[0];
    if (!url) return msg.reply("Kirim URL SoundCloud.\nContoh: .scdl https://soundcloud.com/...");

    await msg.reply("⏳ Downloading...");

    const result = await soundcloudDl(url);

    if (!result.status) {
      return msg.reply(`❌ Gagal: ${result.error || "Tidak ada media ditemukan"}`);
    }

    const { title, artist, duration, artwork, streamUrl } = result.data;

    const caption = [`🎵 *${title}*`, `🎤 ${artist}`, `⏱️ ${duration}`].filter(Boolean).join("\n");

    if (artwork) {
      await msg.send({ image: { url: artwork }, caption });
    } else {
      await msg.reply(caption);
    }

    if (streamUrl) {
      await msg.send({ audio: { url: streamUrl }, mimetype: "audio/mpeg" });
    }
  },
});
