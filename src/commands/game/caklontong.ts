import { defineCommand } from "@/core/types";
import { GameManager } from "@/game/game-helper";
import { getRandomItem, loadGameData } from "@/utils/helper";

const gm = new GameManager(30);

const localData = loadGameData<{ soal: string; jawaban: string; deskripsi: string }>(
  "caklontong.json",
);

export default defineCommand({
  name: "Cak Lontong",
  alias: ["cl", "caklontong"],
  description: "Game TTS Cak Lontong (Ketik 'hint' untuk bantuan)",
  handler: async (sock, msg) => {
    if (msg.args[0] === "hint") {
      const hint = gm.getHint(msg.jid);
      return msg.reply(hint ? `💡 Hint: *${hint}*` : "❌ Tidak ada sesi aktif!");
    }

    const item = getRandomItem(localData);
    const success = gm.start(msg.jid, item.jawaban, msg.sender, () => {
      sock.sendMessage(msg.jid, {
        text: `⏰ Habis! Jawabannya: *${item.jawaban}*\n${item.deskripsi}`,
      });
    });

    if (!success) return msg.reply("⏳ Selesaikan soal sebelumnya!");
    await msg.reply(
      `🧩 *TTS Cak Lontong*\n\nSoal: ${item.soal}\n\nWaktu 60s!\n(Ketik *.caklontong hint*)`,
    );
  },
});

export const checkCakLontong = (jid: string, text: string, sender: string) => {
  const ans = gm.check(jid, text, sender);
  return ans ? `✅ Benar! (+30 XP)` : null;
};
