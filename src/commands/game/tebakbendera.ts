import { defineCommand } from "@/core/types";
import { GameManager } from "@/game/game-helper";
import { getRandomItem, loadGameData } from "@/utils/helper";

const gm = new GameManager(50);

const localData = loadGameData<{ flag: string; img: string; name: string }>("tebakbendera.json");

export default defineCommand({
  name: "Tebak Bendera",
  alias: ["tbb", "bendera"],
  description: "Tebak negara dari gambar bendera (Ketik 'hint' untuk bantuan)",
  handler: async (sock, msg) => {
    if (msg.args[0] === "hint") {
      const hint = gm.getHint(msg.jid);
      return msg.reply(hint ? `💡 Hint: *${hint}*` : "❌ Tidak ada sesi aktif!");
    }

    const item = getRandomItem(localData);
    const success = gm.start(msg.jid, item.name, msg.sender, () => {
      sock.sendMessage(msg.jid, { text: `⏰ Habis! Jawabannya: *${item.name}*` });
    });

    if (!success) return msg.reply("⏳ Selesaikan soal sebelumnya!");
    await msg.send({
      image: { url: item.img },
      caption: `🏁 *Tebak Bendera!*\n\nNegara apa ini?\n\nWaktu 60s!\n(Ketik *.tebakbendera hint*)`,
    });
  },
});

export const checkTebakBendera = (jid: string, text: string, sender: string) => {
  const ans = gm.check(jid, text, sender);
  return ans ? `✅ Benar! Jawabannya adalah *${ans}* (+50 XP)` : null;
};
