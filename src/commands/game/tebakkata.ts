import { createWordGame } from "@/game/word-game-factory";

interface TBKData {
  word: string;
}

function shuffle(word: string): string {
  return word
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

const { command, checkAnswer } = createWordGame<TBKData>({
  name: "Tebak Kata",
  triggers: ["tebakkata", "tbk"],
  description: "Tebak kata dari huruf acak",
  dataFile: "tebakkata.json",
  emoji: "🔤",
  reward: 20,
  question: (item) => {
    let s = shuffle(item.word);
    while (s === item.word) s = shuffle(item.word);
    return `Susun huruf berikut:\n\n*${s.toUpperCase()}*`;
  },
  answer: (item) => item.word,
  correctMessage: (item, _ans) => `✅ Benar! Jawabannya *${item.word}* (+20 XP)`,
});

export default command;
export const checkTebakKata = checkAnswer;
