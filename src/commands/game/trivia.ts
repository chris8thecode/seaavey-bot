import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";
import { getRandomItem } from "@/utils/helper";

const questions = [
  { q: "Ibukota Indonesia?", a: "jakarta" },
  { q: "Planet terbesar di tata surya?", a: "jupiter" },
  { q: "Berapa jumlah provinsi di Indonesia (2024)?", a: "38" },
  { q: "Siapa penemu telepon?", a: "alexander graham bell" },
  { q: "Hewan terbesar di dunia?", a: "paus biru" },
  { q: "Gunung tertinggi di dunia?", a: "everest" },
  { q: "Bahasa pemrograman yang dibuat oleh Brendan Eich?", a: "javascript" },
  { q: "Negara terluas di dunia?", a: "rusia" },
  { q: "Berapa hasil dari 12 x 12?", a: "144" },
  { q: "Warna bendera Indonesia?", a: "merah putih" },
  { q: "Sungai terpanjang di dunia?", a: "nil" },
  { q: "Siapa presiden pertama Indonesia?", a: "soekarno" },
  { q: "Apa lambang negara Indonesia?", a: "garuda" },
  { q: "Berapa jumlah pemain dalam satu tim sepak bola?", a: "11" },
  { q: "Apa nama mata uang Jepang?", a: "yen" },
];

const sessions = new Map<string, { answer: string; timeout: Timer; sender?: string }>();

export default defineCommand({
  name: "Trivia",
  alias: ["trivia"],
  description: t("game.trivia.desc"),
  handler: async (sock, msg) => {
    if (sessions.has(msg.jid)) return msg.reply(t("game.trivia.existing"));

    const item = getRandomItem(questions) as (typeof questions)[number];

    const jid = msg.jid;
    const timeout = setTimeout(() => {
      sessions.delete(jid);
      sock.sendMessage(jid, { text: t("game.trivia.timeout", { answer: item.a }) });
    }, 30_000);

    sessions.set(msg.jid, { answer: item.a, timeout });

    await msg.reply(t("game.trivia.question", { question: item.q }));
  },
});

export function checkTrivia(jid: string, text: string, sender: string): string | null {
  const session = sessions.get(jid);
  if (!session) return null;
  if (!jid.endsWith("@g.us") && sender !== session.sender) return null;
  if (!text.toLowerCase().includes(session.answer)) return null;

  clearTimeout(session.timeout);
  sessions.delete(jid);
  addXp(sender, 15);
  return t("game.trivia.correct", { answer: session.answer });
}
