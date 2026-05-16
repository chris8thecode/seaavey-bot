import { addXp } from "@/database";
import { defineCommand } from "@/types";

const images = [
  { url: "https://i.imgur.com/8QZQZ0m.jpg", answer: "kucing" },
  { url: "https://i.imgur.com/3GvwNBf.jpg", answer: "anjing" },
  { url: "https://i.imgur.com/JQN0g1S.jpg", answer: "gajah" },
  { url: "https://i.imgur.com/YCr7bBX.jpg", answer: "singa" },
  { url: "https://i.imgur.com/5bPxZGo.jpg", answer: "panda" },
];

const sessions = new Map<string, { answer: string; timeout: Timer }>();

export default defineCommand({
  name: "tebakgambar",
  description: "Tebak gambar yang dikirim bot",
  handler: async (sock, msg) => {
    if (sessions.has(msg.jid)) return msg.reply("⏳ Masih ada soal yang belum dijawab!");
    const img = images[Math.floor(Math.random() * images.length)] as (typeof images)[number];
    const jid = msg.jid;
    const timeout = setTimeout(() => {
      sessions.delete(jid);
      sock.sendMessage(jid, { text: `⏰ Waktu habis! Jawabannya *${img.answer}*` });
    }, 60_000);
    sessions.set(jid, { answer: img.answer, timeout });
    await msg.send({
      image: { url: img.url },
      caption: "🖼️ *Tebak Gambar!*\n\nApa ini? Jawab dalam 60 detik!",
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
  return `✅ Benar! Jawabannya *${session.answer}* (+20 XP)`;
}
