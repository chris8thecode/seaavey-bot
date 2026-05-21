import { defineCommand } from "@/core/types";
import { GameManager } from "@/game/game-helper";
import { getRandomItem, loadGameData } from "@/utils/helper";

interface TebakTebakanData {
  soal: string;
  jawaban: string;
}

const gm = new GameManager(15);
const localData = loadGameData<TebakTebakanData>("tebaktebakan.json");

export default defineCommand({
  name: "Tebak Tebakan",
  alias: ["tbtb", "tebaktebakan"],
  description: "Game teka-teki lucu (Ketik 'hint' untuk bantuan)",
  handler: async (sock, msg) => {
    if (msg.args[0] === "hint") {
      const hint = gm.getHint(msg.jid);
      return msg.reply(hint ? `💡 Hint: *${hint}*` : "❌ Tidak ada sesi aktif!");
    }

    if (!localData.length) return msg.reply("❌ Data kosong.");
    const item = getRandomItem(localData);
    const success = gm.start(msg.jid, item.jawaban, msg.sender, () => {
      sock.sendMessage(msg.jid, { text: `⏰ Habis! Jawabannya: *${item.jawaban}*` });
    });

    if (!success) return msg.reply("⏳ Selesaikan soal sebelumnya!");
    await msg.reply(
      `😂 *Tebak Tebakan*\n\nSoal: ${item.soal}\n\nWaktu 60s!\n(Ketik *.tebaktebakan hint*)`,
    );
  },
});

export function checkTebakTebakan(jid: string, text: string, sender: string) {
  const ans = gm.check(jid, text.trim(), sender);
  return ans ? `✅ Benar! Jawabannya *${ans.toUpperCase()}* (+15 XP)` : null;
}
