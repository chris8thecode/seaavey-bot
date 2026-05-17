import { addXp } from "@/database";
import { logger } from "@/logger";
import { defineCommand } from "@/types";

const sessions = new Map<string, { answer: string; timeout: Timer }>();

export default defineCommand({
  name: "tebakgambar",
  description: "Tebak gambar yang dikirim bot",
  handler: async (sock, msg) => {
    if (sessions.has(msg.jid)) return msg.reply("⏳ Masih ada soal yang belum dijawab!");

    let imgData: { img: string; jawaban: string; deskripsi: string };
    try {
      const res = await fetch(
        "https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakgambar.json",
      );
      const data = (await res.json()) as (typeof imgData)[];
      imgData = data[Math.floor(Math.random() * data.length)] as typeof imgData;
    } catch (e) {
      logger.error(`TebakGambar fetch error: ${e}`);
      return msg.reply("❌ Gagal mengambil soal tebak gambar.");
    }

    const jid = msg.jid;
    const answer = imgData.jawaban.toLowerCase();

    const timeout = setTimeout(() => {
      sessions.delete(jid);
      sock.sendMessage(jid, {
        text: `⏰ Waktu habis!\n\nJawabannya: *${imgData.jawaban}*\nDeskripsi: ${imgData.deskripsi}`,
      });
    }, 60_000);

    sessions.set(jid, { answer, timeout });

    await msg.send({
      image: { url: imgData.img },
      caption: `🖼️ *Tebak Gambar!*\n\nClue: ${imgData.deskripsi}\n\nJawab dalam 60 detik!`,
    });
  },
});

export function checkTebakGambar(jid: string, text: string, sender: string): string | null {
  const session = sessions.get(jid);
  if (!session) return null;
  if (text.toLowerCase() !== session.answer) return null;
  clearTimeout(session.timeout);
  sessions.delete(jid);
  addXp(sender, 20);
  return `✅ Benar! Jawabannya *${session.answer.toUpperCase()}* (+20 XP)`;
}
