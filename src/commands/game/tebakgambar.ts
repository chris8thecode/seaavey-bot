import { readFileSync } from "node:fs";
import { join } from "node:path";
import { addXp } from "@/database";
import { getRandomItem } from "@/helper";
import { logger } from "@/logger";
import { defineCommand } from "@/types";

const sessions = new Map<string, { answer: string; timeout: Timer }>();

// Load local database
let localData: { img: string; jawaban: string; deskripsi: string }[] = [];
try {
  const fileContent = readFileSync(
    join(import.meta.dir, "..", "..", "assets", "tebakgambar.json"),
    "utf-8",
  );
  localData = JSON.parse(fileContent);
} catch (_e) {
  logger.error("Local tebakgambar.json not found or invalid.");
}

export default defineCommand({
  name: "tebakgambar",
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
