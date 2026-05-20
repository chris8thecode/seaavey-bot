import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";
import { getRandomItem, loadGameData } from "@/utils/helper";

const sessions = new Map<string, { answer: string; timeout: Timer; sender?: string }>();

const localData = loadGameData<{ img: string; jawaban: string; deskripsi: string }>(
  "tebakgambar.json",
);

export default defineCommand({
  name: "Tebak Gambar",
  alias: ["tbg", "tebakgambar"],
  description: "Tebak gambar yang dikirim bot",
  handler: async (sock, msg) => {
    if (sessions.has(msg.jid)) return msg.reply("⏳ Masih ada soal yang belum dijawab!");

    if (localData.length === 0) {
      return msg.reply("❌ Data soal tebak gambar belum tersedia.");
    }

    const imgData = getRandomItem(localData) as (typeof localData)[number];
    const jid = msg.jid;
    const answer = imgData.jawaban.toLowerCase();

    const timeout = setTimeout(() => {
      sessions.delete(jid);
      sock.sendMessage(jid, {
        text: `⏰ Waktu habis!\n\nJawabannya: *${imgData.jawaban}*\nDeskripsi: ${imgData.deskripsi}`,
      });
    }, 60_000);

    sessions.set(jid, { answer, timeout, sender: msg.sender });

    await msg.send({
      image: { url: imgData.img },
      caption: `🖼️ *Tebak Gambar!*\n\nClue: ${imgData.deskripsi}\n\nJawab dalam 60 detik!`,
    });
  },
});

export function checkTebakGambar(jid: string, text: string, sender: string): string | null {
  const session = sessions.get(jid);
  if (!session) return null;
  if (!jid.endsWith("@g.us") && sender !== session.sender) return null;
  if (text.toLowerCase() !== session.answer) return null;
  clearTimeout(session.timeout);
  sessions.delete(jid);
  addXp(sender, 20);
  return `✅ Benar! Jawabannya *${session.answer.toUpperCase()}* (+20 XP)`;
}
