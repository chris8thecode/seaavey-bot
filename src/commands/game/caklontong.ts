import { readFileSync } from "node:fs";
import { join } from "node:path";
import { logger } from "@/core/logger";
import { defineCommand } from "@/core/types";
import { GameManager } from "@/game/game-helper";
import { getRandomItem } from "@/utils/helper";

const gm = new GameManager(30);

let localData: { soal: string; jawaban: string; deskripsi: string }[] = [];
try {
  localData = JSON.parse(
    readFileSync(join(process.cwd(), "src", "data", "games", "caklontong.json"), "utf-8"),
  );
} catch (_e) {
  logger.error("caklontong.json error");
}

export default defineCommand({
  name: "Cak Lontong",
  alias: ["cl"],
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
