import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";
import { getRandomItem, loadGameData } from "@/utils/helper";

const localData = loadGameData<{ soal: string; jawaban: string[] }>("family100.json");

const sessions = new Map<
  string,
  {
    question: string;
    answers: string[];
    answered: string[];
    timeout: Timer;
  }
>();

export default defineCommand({
  name: "Family 100",
  alias: ["f100", "family100"],
  description: t("game.family100.desc"),
  groupOnly: true,
  handler: async (sock, msg) => {
    if (sessions.has(msg.jid)) {
      return msg.reply(t("game.family100.existing"));
    }

    if (localData.length === 0) {
      return msg.reply(t("game.family100.noData"));
    }

    const surveyData = getRandomItem(localData) as (typeof localData)[number];
    const jid = msg.jid;
    const question = surveyData.soal;
    const answers = surveyData.jawaban.map((a) => a.toLowerCase().trim());

    const timeout = setTimeout(() => {
      const session = sessions.get(jid);
      if (session) {
        sessions.delete(jid);
        const unanswered = session.answers.filter((a) => !session.answered.includes(a));
        const list = unanswered.map((a, i) => `${i + 1}. ${a}`).join("\n");
        sock.sendMessage(jid, { text: t("game.family100.timeout", { unanswered: list }) });
      }
    }, 120_000); // 2 minutes

    sessions.set(jid, {
      question,
      answers,
      answered: [],
      timeout,
    });

    const blanks = answers.map((_, i) => `${i + 1}. ⬛⬛⬛⬛⬛`).join("\n");

    await msg.reply(t("game.family100.board", { question, count: answers.length, blanks }));
  },
});

export function checkFamily100(jid: string, text: string, sender: string): string | null {
  const session = sessions.get(jid);
  if (!session) return null;

  const answer = text.toLowerCase().trim();
  const index = session.answers.indexOf(answer);

  if (index !== -1) {
    if (session.answered.includes(answer)) {
      return t("game.family100.jawabanDitebak", { answer });
    }

    session.answered.push(answer);
    addXp(sender, 50);

    if (session.answered.length === session.answers.length) {
      clearTimeout(session.timeout);
      sessions.delete(jid);
      return t("game.family100.perfect", { answer });
    }

    let board = `🎯 *FAMILY 100* 🎯\n\n*Pertanyaan:* ${session.question}\n\n`;
    session.answers.forEach((ans, i) => {
      if (session.answered.includes(ans)) {
        board += `${i + 1}. ${ans} ✅\n`;
      } else {
        board += `${i + 1}. ⬛⬛⬛⬛⬛\n`;
      }
    });

    return t("game.family100.boardUpdate", { board: board.trim(), answer });
  }

  return null;
}
