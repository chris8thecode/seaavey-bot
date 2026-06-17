import { createWordGame } from "@/game/word-game-factory";

interface SAHData {
  soal: string;
  jawaban: string;
}

const { command, checkAnswer } = createWordGame<SAHData>({
  name: "Siapakah Aku",
  triggers: ["siapakahaku", "sah", "siapa"],
  description: "Game siapakah aku (Ketik 'hint' untuk bantuan)",
  dataFile: "siapakahaku.json",
  emoji: "🕵️",
  reward: 15,
  question: (item) => `Soal: ${item.soal}`,
  answer: (item) => item.jawaban,
  correctMessage: (item, _ans) =>
    `✅ Benar! Jawabannya *${item.jawaban}* (+15 XP)`,
});

export default command;
export const checkSiapakahAku = checkAnswer;
