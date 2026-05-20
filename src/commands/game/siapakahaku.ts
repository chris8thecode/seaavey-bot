import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";
import { getRandomItem, loadGameData } from "@/utils/helper";

const sessions = new Map<
  string,
  { answer: string; hint: string; timeout: Timer; sender?: string }
>();

const localData = loadGameData<{ soal: string; jawaban: string }>("siapakahaku.json");

export default defineCommand({
  name: "Siapakah Aku",
  alias: ["sah", "siapa"],
  description: "Game siapakah aku (Ketik 'hint' untuk bantuan)",
  handler: async (sock, msg) => {
    const jid = msg.jid;
    if (msg.args[0] === "hint") {
      const session = sessions.get(jid);
      if (!session) return msg.reply("❌ Tidak ada sesi game yang aktif!");
      return msg.reply(`💡 Hint: *${session.hint}*`);
    }

    if (sessions.has(jid)) return msg.reply("⏳ Selesaikan soal sebelumnya!");
    if (!localData.length) return msg.reply("❌ Data kosong.");

    const item = getRandomItem(localData);
    const answer = item.jawaban;
    const hint = answer.replace(/[a-zA-Z]/g, (l, i) => (i % 2 === 0 ? l : "_"));

    const timeout = setTimeout(() => {
      sessions.delete(jid);
      sock.sendMessage(jid, { text: `⏰ Habis! Jawabannya: *${answer}*` });
    }, 60000);

    sessions.set(jid, { answer: answer.toLowerCase(), hint, timeout, sender: msg.sender });
    await msg.reply(
      `🕵️ *Siapakah Aku?*\n\nSoal: ${item.soal}\n\nWaktu 60s!\n(Ketik *.siapakahaku hint* untuk bantuan)`,
    );
  },
});

export function checkSiapakahAku(jid: string, text: string, sender: string): string | null {
  const session = sessions.get(jid);
  if (!session) return null;
  if (!jid.endsWith("@g.us") && sender !== session.sender) return null;
  if (text.toLowerCase() === "hint") return null;
  if (text.toLowerCase() !== session.answer) return null;
  clearTimeout(session.timeout);
  sessions.delete(jid);
  addXp(sender, 15);
  return `✅ Benar! Jawabannya *${session.answer.toUpperCase()}* (+15 XP)`;
}
