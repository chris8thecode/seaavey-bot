import { createWordGame } from "@/game/word-game-factory";

interface MemberData {
  img: string;
  jawaban: string;
  nama_panggilan?: string;
}

const { command, checkAnswer } = createWordGame<MemberData>({
  name: "Tebak Member JKT48",
  triggers: ["tebakmemberjkt48", "tmjkt", "tebakjkt"],
  description: "Tebak nama member JKT48 dari foto",
  dataFile: "tebakmemberjkt48.json",
  emoji: "👩",
  reward: 20,
  question: (item) =>
    `Siapa nama member ini?${item.nama_panggilan ? `\n\nClue: ${item.nama_panggilan}` : ""}`,
  answer: (item) => item.jawaban,
  image: (item) => item.img,
  timeoutMessage: (item, _ans) =>
    item.nama_panggilan
      ? `⏰ Habis! Jawabannya: *${item.jawaban}* (${item.nama_panggilan})`
      : `⏰ Habis! Jawabannya: *${item.jawaban}*`,
  correctMessage: (item, _ans) =>
    `✅ Benar! Jawabannya *${item.jawaban}* (+20 XP)`,
});

export default command;
export const checkTebakMemberJKT48 = checkAnswer;
