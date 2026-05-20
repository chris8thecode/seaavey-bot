import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";
import { getRandomItem, loadGameData } from "@/utils/helper";

interface MemberData {
  img: string;
  jawaban: string;
  nama_panggilan?: string;
}

const localData = loadGameData<MemberData>("tebakmemberjkt48.json");

const sessions = new Map<string, { answer: string; timeout: Timer; sender?: string }>();

export default defineCommand({
  name: "Tebak Member JKT48",
  alias: ["tmjkt", "tebakjkt"],
  description: "Tebak nama member JKT48 dari foto",
  handler: async (sock, msg) => {
    if (sessions.has(msg.jid)) return msg.reply("⏳ Masih ada soal yang belum dijawab!");
    if (!localData.length) return msg.reply("❌ Data member belum tersedia.");

    const item = getRandomItem(localData);

    const jid = msg.jid;
    const timeout = setTimeout(() => {
      sessions.delete(jid);
      sock.sendMessage(jid, {
        text: item.nama_panggilan
          ? `⏰ Habis! Jawabannya: *${item.jawaban}* (${item.nama_panggilan})`
          : `⏰ Habis! Jawabannya: *${item.jawaban}*`,
      });
    }, 60_000);

    sessions.set(jid, { answer: item.jawaban.toLowerCase(), timeout, sender: msg.sender });

    const nicknameLine = item.nama_panggilan ? `\n\nClue: ${item.nama_panggilan}` : "";
    await msg.send({
      image: { url: item.img },
      caption: `👩 *Tebak Member JKT48!*\n\nSiapa nama member ini?${nicknameLine}\n\nWaktu 60s!`,
    });
  },
});

export function checkTebakMemberJKT48(jid: string, text: string, sender: string): string | null {
  const session = sessions.get(jid);
  if (!session) return null;
  if (!jid.endsWith("@g.us") && sender !== session.sender) return null;

  const input = text.toLowerCase().trim();
  if (input !== session.answer) return null;

  clearTimeout(session.timeout);
  sessions.delete(jid);
  addXp(sender, 20);
  return `✅ Benar! Jawabannya *${session.answer}* (+20 XP)`;
}
