import { readFileSync } from "node:fs";
import { join } from "node:path";
import { addXp } from "@/database";
import { logger } from "@/logger";
import { defineCommand } from "@/types";

const sessions = new Map<string, { answer: string; timeout: Timer }>();

// Load local database if available, otherwise fallback to empty array
let localData: { img: string; jawaban: string; deskripsi: string }[] = [];
try {
  const fileContent = readFileSync(
    join(import.meta.dir, "..", "..", "assets", "tebakgambar.json"),
    "utf-8",
  );
  localData = JSON.parse(fileContent);
} catch (_e) {
  logger.warn("Local tebakgambar.json not found or invalid.");
}

export default defineCommand({
  name: "tebakgambar",
  description: "Tebak gambar yang dikirim bot",
  handler: async (sock, msg) => {
    if (sessions.has(msg.jid)) return msg.reply("⏳ Masih ada soal yang belum dijawab!");

    let imgData: { img: string; jawaban: string; deskripsi: string };

    if (localData.length > 0) {
      imgData = localData[Math.floor(Math.random() * localData.length)] as typeof imgData;
    } else {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakgambar.json",
        );
        const data = (await res.json()) as typeof localData;
        imgData = data[Math.floor(Math.random() * data.length)] as typeof imgData;
      } catch (e) {
        logger.error(`TebakGambar fetch error: ${e}`);
        return msg.reply("❌ Gagal mengambil soal tebak gambar.");
      }
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
