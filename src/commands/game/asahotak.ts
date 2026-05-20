import { defineCommand } from "@/core/types";
import { GameManager } from "@/game/game-helper";
import { getRandomItem, loadGameData } from "@/utils/helper";

const gm = new GameManager(15);

const localData = loadGameData<{ soal: string; jawaban: string }>("asahotak.json");

export default defineCommand({
  name: "Asah Otak",
  alias: ["ao"],
  description: "Game asah otak (Ketik 'hint' untuk bantuan)",
  handler: async (sock, msg) => {
    if (msg.args[0] === "hint") {
      const hint = gm.getHint(msg.jid);
      return msg.reply(hint ? `💡 Hint: *${hint}*` : "❌ Tidak ada sesi aktif!");
    }

    const item = getRandomItem(localData);
    const success = gm.start(msg.jid, item.jawaban, msg.sender, () => {
      sock.sendMessage(msg.jid, { text: `⏰ Habis! Jawabannya: *${item.jawaban}*` });
    });

    if (!success) return msg.reply("⏳ Selesaikan soal sebelumnya!");
    await msg.reply(`🧠 *Asah Otak*\n\nSoal: ${item.soal}\n\nWaktu 60s!\n(Ketik *.asahotak hint*)`);
  },
});

export const checkAsahOtak = (jid: string, text: string, sender: string) => {
  const ans = gm.check(jid, text, sender);
  return ans ? `✅ Benar! Jawabannya *${ans.toUpperCase()}* (+15 XP)` : null;
};
