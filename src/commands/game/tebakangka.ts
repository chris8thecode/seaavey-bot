import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";
import { getRandomNumber } from "@/utils/helper";

const sessions = new Map<string, { answer: number; attempts: number; timeout: Timer }>();

export default defineCommand({
  name: "Tebak Angka",
  alias: ["tbka", "tebakangka"],
  description: t("game.tebakangka.desc"),
  handler: async (sock, msg) => {
    const key = `${msg.jid}:${msg.sender}`;
    const session = sessions.get(key);

    if (!msg.args[0]) {
      if (session) return msg.reply(t("game.tebakangka.existing"));
      const answer = getRandomNumber(1, 100);
      const jid = msg.jid;
      const timeout = setTimeout(() => {
        sessions.delete(key);
        sock.sendMessage(jid, { text: t("game.tebakangka.timeout", { answer }) });
      }, 120_000);
      sessions.set(key, { answer, attempts: 0, timeout });
      return msg.reply(t("game.tebakangka.start"));
    }

    if (!session) return msg.reply(t("game.tebakangka.noSession"));

    if (msg.args[0] === "nyerah") {
      clearTimeout(session.timeout);
      sessions.delete(key);
      return msg.reply(t("game.tebakangka.surrender", { answer: session.answer }));
    }

    const guess = Number(msg.args[0]);
    if (!guess || guess < 1 || guess > 100) return msg.reply(t("game.tebakangka.invalidNumber"));

    session.attempts++;

    if (guess === session.answer) {
      clearTimeout(session.timeout);
      sessions.delete(key);
      const xp = Math.max(30 - session.attempts * 3, 10);
      addXp(msg.sender, xp);
      return msg.reply(
        t("game.tebakangka.correct", { answer: session.answer, attempts: session.attempts, xp }),
      );
    }

    if (session.attempts >= 10) {
      clearTimeout(session.timeout);
      sessions.delete(key);
      return msg.reply(t("game.tebakangka.attemptsExhausted", { answer: session.answer }));
    }

    const hint = guess < session.answer ? "⬆️ Lebih tinggi!" : "⬇️ Lebih rendah!";
    await msg.reply(t("game.tebakangka.hint", { hint, attempts: session.attempts }));
  },
});
