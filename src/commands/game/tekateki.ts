import { createWordGame } from "@/game/word-game-factory";

interface TTData {
  soal: string;
  jawaban: string;
}

const { command, checkAnswer } = createWordGame<TTData>({
  name: "Teka Teki",
  triggers: ["tekateki", "tt"],
  description: "Game teka-teki",
  dataFile: "tekateki.json",
  emoji: "🧩",
  reward: 15,
  question: (item) => `Soal: ${item.soal}`,
  answer: (item) => item.jawaban,
  correctMessage: (_item, _ans) => "✅ Benar! (+15 XP)",
});

export default command;
export const checkTekaTeki = checkAnswer;
