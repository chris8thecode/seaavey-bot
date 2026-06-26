import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { GameManager } from "@/game/game-helper";
import { getRandomItem, loadGameData } from "@/utils/helper";

const gm = new GameManager(15);

const localData = loadGameData<{ soal: string; jawaban: string }>("asahotak.json");

export default defineCommand({
  name: "Asah Otak",
  alias: ["ao", "asahotak"],
  description: t("game.asahotak.desc"),
  handler: async (sock, msg) => {
    if (msg.args[0] === "hint") {
      const hint = gm.getHint(msg.jid);
      return msg.reply(hint ? t("game.asahotak.hint", { hint }) : t("game.asahotak.noSession"));
    }

    const item = getRandomItem(localData);
    const success = gm.start(msg.jid, item.jawaban, msg.sender, () => {
      sock.sendMessage(msg.jid, { text: t("game.asahotak.timeout", { answer: item.jawaban }) });
    });

    if (!success) return msg.reply(t("game.asahotak.finishPrevious"));
    await msg.reply(t("game.asahotak.start", { question: item.soal }));
  },
});

export const checkAsahOtak = (jid: string, text: string, sender: string) => {
  const ans = gm.check(jid, text, sender);
  return ans ? t("game.asahotak.correct", { answer: ans.toUpperCase() }) : null;
};
