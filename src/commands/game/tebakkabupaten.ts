import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";
import { getRandomItem, loadGameData } from "@/utils/helper";

interface TebakKabupatenData {
  title: string;
  url: string;
}

const sessions = new Map<string, { answer: string; timeout: Timer; sender?: string }>();
const localData = loadGameData<TebakKabupatenData>("tebakkabupaten.json");

export default defineCommand({
  name: "Tebak Kabupaten",
  alias: ["tbkp", "tebakkabupaten"],
  description: "Tebak nama kabupaten dari gambar lambang daerah",
  handler: async (sock, msg) => {
    if (sessions.has(msg.jid)) return msg.reply("⏳ Masih ada soal yang belum dijawab!");
    if (!localData.length) return msg.reply("❌ Data kosong.");

    const item = getRandomItem(localData);
    const jid = msg.jid;
    const answer = item.title.replace(/^(Kabupaten|Kota)\s*/i, "").toLowerCase();

    const timeout = setTimeout(() => {
      sessions.delete(jid);
      sock.sendMessage(jid, {
        text: `⏰ Habis! Jawabannya: *${item.title}*`,
      });
    }, 60000);

    sessions.set(jid, { answer, timeout, sender: msg.sender });

    await msg.send({
      image: { url: item.url },
      caption: `🏛️ *Tebak Kabupaten!*\n\nTebak nama kabupaten/kota dari lambang di atas!\nJawab dalam 60 detik!`,
    });
  },
});

export function checkTebakKabupaten(jid: string, text: string, sender: string): string | null {
  const session = sessions.get(jid);
  if (!session) return null;
  if (!jid.endsWith("@g.us") && sender !== session.sender) return null;
  if (text.toLowerCase() !== session.answer) return null;
  clearTimeout(session.timeout);
  sessions.delete(jid);
  addXp(sender, 20);
  return `✅ Benar! Jawabannya *${session.answer}* (+20 XP)`;
}
