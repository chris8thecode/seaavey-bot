import { defineCommand } from "@/core/types";
import { GameManager } from "@/game/game-helper";
import { getRandomItem, loadGameData } from "@/utils/helper";

interface TebakKimiaData {
  unsur: string;
  lambang: string;
}

const gm = new GameManager(15);
const localData = loadGameData<TebakKimiaData>("tebakkimia.json");

export default defineCommand({
  name: "Tebak Kimia",
  alias: ["tbkm", "tebakkimia"],
  description: "Tebak lambang unsur kimia (Ketik 'hint' untuk bantuan)",
  handler: async (sock, msg) => {
    if (msg.args[0] === "hint") {
      const hint = gm.getHint(msg.jid);
      return msg.reply(hint ? `💡 Hint: *${hint}*` : "❌ Tidak ada sesi aktif!");
    }

    if (!localData.length) return msg.reply("❌ Data kosong.");
    const item = getRandomItem(localData);
    const success = gm.start(msg.jid, item.lambang, msg.sender, () => {
      sock.sendMessage(msg.jid, {
        text: `⏰ Habis! Jawabannya: *${item.lambang}* (${item.unsur})`,
      });
    });

    if (!success) return msg.reply("⏳ Selesaikan soal sebelumnya!");
    await msg.reply(
      `⚗️ *Tebak Kimia*\n\nUnsur: *${item.unsur}*\n\nKetik lambang unsurnya!\nWaktu 60s!\n(Ketik *.tebakkimia hint*)`,
    );
  },
});

export function checkTebakKimia(jid: string, text: string, sender: string) {
  const ans = gm.check(jid, text.trim(), sender);
  return ans
    ? `✅ Benar! Lambang dari *${localData.find((d) => d.lambang.toLowerCase() === ans)?.unsur}* adalah *${ans.toUpperCase()}* (+15 XP)`
    : null;
}
