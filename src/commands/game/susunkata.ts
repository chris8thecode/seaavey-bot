import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";
import { getRandomItem, loadGameData } from "@/utils/helper";

interface SusunKataData {
  soal: string;
  tipe: string;
  jawaban: string;
}

const sessions = new Map<string, { answer: string; timeout: Timer; sender?: string }>();
const localData = loadGameData<SusunKataData>("susunkata.json");

export default defineCommand({
  name: "Susun Kata",
  alias: ["sk", "susunkata"],
  description: "Susun huruf acak menjadi kata yang benar",
  handler: async (sock, msg) => {
    if (sessions.has(msg.jid)) return msg.reply("⏳ Masih ada soal yang belum dijawab!");
    if (!localData.length) return msg.reply("❌ Data kosong.");

    const item = getRandomItem(localData);
    const jid = msg.jid;
    const answer = item.jawaban.toLowerCase();

    const timeout = setTimeout(() => {
      sessions.delete(jid);
      sock.sendMessage(jid, { text: `⏰ Habis! Jawabannya: *${item.jawaban}*` });
    }, 60000);

    sessions.set(jid, { answer, timeout, sender: msg.sender });

    await msg.reply(
      `🔤 *Susun Kata*\n\nHuruf: *${item.soal}*\nTipe: *${item.tipe}*\n\nJawab dalam 60 detik!`,
    );
  },
});

export function checkSusunKata(jid: string, text: string, sender: string): string | null {
  const session = sessions.get(jid);
  if (!session) return null;
  if (!jid.endsWith("@g.us") && sender !== session.sender) return null;
  if (text.toLowerCase() !== session.answer) return null;
  clearTimeout(session.timeout);
  sessions.delete(jid);
  addXp(sender, 15);
  return `✅ Benar! Jawabannya *${session.answer.toUpperCase()}* (+15 XP)`;
}
