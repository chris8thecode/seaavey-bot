import { defineCommand } from "@/core/types";
import { spotify, spotifySearch } from "@/infra/scrapers";

export default defineCommand({
  name: "Spotify",
  alias: ["spot", "spotify"],
  description: "Search atau download lagu dari Spotify",
  handler: async (_sock, msg) => {
    const input = msg.args.join(" ");
    if (!input) {
      return msg.reply(
        "Kirim URL atau judul lagu.\n\nContoh:\n• spotify https://open.spotify.com/track/...\n• spotify Faded Alan Walker",
      );
    }

    const isUrl = input.includes("open.spotify.com");

    if (isUrl) {
      await msg.reply("⏳ Mengambil info lagu...");

      const result = await spotify(input);

      if (!result.status) {
        return msg.reply(`❌ Gagal: ${result.error}`);
      }

      const { title, artist, album, duration, cover, downloadUrl } = result.data;

      const caption = [
        `🎵 *${title}*`,
        `🎤 ${artist}`,
        album ? `💿 ${album}` : null,
        `⏱️ ${duration}`,
      ]
        .filter(Boolean)
        .join("\n");

      if (cover) {
        await msg.send({ image: { url: cover }, caption });
      } else {
        await msg.reply(caption);
      }

      if (downloadUrl) {
        await msg.send({ audio: { url: downloadUrl }, mimetype: "audio/mpeg" });
      }
    } else {
      await msg.reply("🔍 Mencari lagu...");

      const result = await spotifySearch(input, 5);

      if (!result.status) {
        return msg.reply(`❌ Gagal: ${result.error}`);
      }

      if (result.data.tracks.length === 0) {
        return msg.reply("❌ Lagu tidak ditemukan.");
      }

      const tracks = result.data.tracks
        .map((t, i) => `${i + 1}. 🎵 *${t.title}*\n   🎤 ${t.artist} • ⏱️ ${t.duration}`)
        .join("\n\n");

      await msg.reply(
        `🔍 Hasil pencarian "*${result.data.query}*":\n\n${tracks}\n\nKirim nomor (1-${result.data.tracks.length}) untuk download.`,
      );
    }
  },
});
