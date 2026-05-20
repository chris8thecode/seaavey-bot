import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";
import { getRandomItem, loadGameData } from "@/utils/helper";

interface AnimeData {
  img: string;
  jawaban: string;
  karakter?: string;
}

const localData = loadGameData<AnimeData>("tebakanime.json");

const sessions = new Map<string, { answer: string; timeout: Timer; sender?: string }>();

export default defineCommand({
  name: "Tebak Anime",
  alias: ["tba", "tebakanime"],
  description: "Tebak judul anime dari gambar (Ketik 'hint' untuk bantuan)",
  handler: async (sock, msg) => {
    if (sessions.has(msg.jid)) return msg.reply("⏳ Masih ada soal yang belum dijawab!");
    if (!localData.length) return msg.reply("❌ Data anime belum tersedia.");

    const item = getRandomItem(localData);
    const answer = item.jawaban.toLowerCase();

    const jid = msg.jid;
    const timeout = setTimeout(() => {
      sessions.delete(jid);
      sock.sendMessage(jid, {
        text: item.karakter
          ? `⏰ Habis! Jawabannya: *${item.jawaban}* (${item.karakter})`
          : `⏰ Habis! Jawabannya: *${item.jawaban}*`,
      });
    }, 60_000);

    sessions.set(jid, { answer, timeout, sender: msg.sender });

    const characterLine = item.karakter ? `\n\nKarakter: ${item.karakter}` : "";
    await msg.send({
      image: { url: item.img },
      caption: `🎌 *Tebak Anime!*\n\nAnime apa ini?${characterLine}\n\nWaktu 60s!\n(Ketik *.tebakanime hint*)`,
    });
  },
});

export function checkTebakAnime(jid: string, text: string, sender: string): string | null {
  const session = sessions.get(jid);
  if (!session) return null;
  if (!jid.endsWith("@g.us") && sender !== session.sender) return null;

  const input = text.toLowerCase().trim();
  if (input === "hint") return "💡 Hint tidak tersedia untuk game ini.";

  if (input !== session.answer) return null;
  clearTimeout(session.timeout);
  sessions.delete(jid);
  addXp(sender, 15);
  return `✅ Benar! Judulnya *${session.answer}* (+15 XP)`;
}
