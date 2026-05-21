import { defineCommand } from "@/core/types";
import { GameManager } from "@/game/game-helper";
import { getRandomItem, loadGameData } from "@/utils/helper";

interface TebakKalimatData {
  soal: string;
  jawaban: string;
}

const gm = new GameManager(15);
const localData = loadGameData<TebakKalimatData>("tebakkalimat.json");

export default defineCommand({
  name: "Tebak Kalimat",
  alias: ["tblm", "tebakkalimat"],
  description: "Lengkapi kalimat peribahasa/ungkapan (Ketik 'hint' untuk bantuan)",
  handler: async (sock, msg) => {
    if (msg.args[0] === "hint") {
      const hint = gm.getHint(msg.jid);
      return msg.reply(hint ? `💡 Hint: *${hint}*` : "❌ Tidak ada sesi aktif!");
    }

    if (!localData.length) return msg.reply("❌ Data kosong.");
    const item = getRandomItem(localData);
    const success = gm.start(msg.jid, item.jawaban, msg.sender, () => {
      sock.sendMessage(msg.jid, { text: `⏰ Habis! Jawabannya: *${item.jawaban.trim()}*` });
    });

    if (!success) return msg.reply("⏳ Selesaikan soal sebelumnya!");
    await msg.reply(
      `📖 *Tebak Kalimat*\n\nKalimat: ${item.soal}\n\nWaktu 60s!\n(Ketik *.tebakkalimat hint*)`,
    );
  },
});

export function checkTebakKalimat(jid: string, text: string, sender: string) {
  const ans = gm.check(jid, text.trim(), sender);
  return ans ? `✅ Benar! Jawabannya *${ans.trim().toUpperCase()}* (+15 XP)` : null;
}
