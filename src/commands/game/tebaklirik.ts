import { defineCommand } from "@/core/types";
import { GameManager } from "@/game/game-helper";
import { getRandomItem, loadGameData } from "@/utils/helper";

interface TebakLirikData {
  soal: string;
  jawaban: string;
}

const gm = new GameManager(15);
const localData = loadGameData<TebakLirikData>("tebaklirik.json");

export default defineCommand({
  name: "Tebak Lirik",
  alias: ["tblr", "tebaklirik"],
  description: "Tebak kata yang hilang dari lirik lagu (Ketik 'hint' untuk bantuan)",
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
      `🎵 *Tebak Lirik*\n\nLirik: ${item.soal}\n\nWaktu 60s!\n(Ketik *.tebaklirik hint*)`,
    );
  },
});

export function checkTebakLirik(jid: string, text: string, sender: string) {
  const ans = gm.check(jid, text.trim(), sender);
  return ans ? `✅ Benar! Jawabannya *${ans.toUpperCase()}* (+15 XP)` : null;
}
