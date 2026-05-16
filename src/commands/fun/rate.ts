import { defineCommand } from "@/types";

const categories = [
  "Kegantengan",
  "Kecantikan",
  "Keberuntungan",
  "Kejeniusan",
  "Kemalasan",
  "Kesabaran",
  "Kebaikan hati",
  "Kegabutan",
];

export default defineCommand({
  name: "rate",
  description: "Rate seseorang secara random",
  handler: async (_sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted || msg.sender;
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const score = Math.floor(Math.random() * 101);
    await msg.send({
      text: `⭐ *Rate*\n\n👤 @${target.replace(/@.+/, "")}\n📊 ${cat}: *${score}/100*`,
      mentions: [target],
    });
  },
});
