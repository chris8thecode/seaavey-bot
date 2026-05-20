import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";
import { getRandomItem, loadGameData } from "@/utils/helper";

interface WaifuData {
  img: string;
  jawaban: string;
  seri: string;
}

const localData = loadGameData<WaifuData>("tebakwaifu.json");

const sessions = new Map<string, { answer: string; timeout: Timer; sender?: string }>();

export default defineCommand({
  name: "Tebak Waifu",
  alias: ["tw", "tebakwaifu"],
  description: "Tebak nama waifu dari foto (Ketik 'hint' untuk bantuan)",
  handler: async (sock, msg) => {
    if (sessions.has(msg.jid)) return msg.reply("⏳ Masih ada soal yang belum dijawab!");
    if (!localData.length) return msg.reply("❌ Data waifu belum tersedia.");

    const item = getRandomItem(localData);

    const jid = msg.jid;
    const timeout = setTimeout(() => {
      sessions.delete(jid);
      sock.sendMessage(jid, {
        text: `⏰ Habis! Jawabannya: *${item.jawaban}* (${item.seri})`,
      });
    }, 60_000);

    sessions.set(jid, { answer: item.jawaban.toLowerCase(), timeout, sender: msg.sender });

    await msg.send({
      image: { url: item.img },
      caption: `🌸 *Tebak Waifu!*\n\nSiapa nama waifu ini?\n\nWaktu 60s!\n(Ketik *.tebakwaifu hint*)`,
    });
  },
});

export function checkTebakWaifu(jid: string, text: string, sender: string): string | null {
  const session = sessions.get(jid);
  if (!session) return null;
  if (!jid.endsWith("@g.us") && sender !== session.sender) return null;

  const input = text.toLowerCase().trim();
  if (input === "hint") return "💡 Hint tidak tersedia untuk game ini.";

  if (input !== session.answer) return null;

  clearTimeout(session.timeout);
  sessions.delete(jid);
  addXp(sender, 20);
  return `✅ Benar! Jawabannya *${session.answer}* (+20 XP)`;
}
