import { getUser } from "@/database";
import { defineCommand } from "@/types";

export default defineCommand({
  name: "level",
  description: "Cek level dan XP kamu",
  handler: async (_sock, msg) => {
    const user = getUser(msg.sender);
    const level = user?.level ?? 1;
    const xp = user?.xp ?? 0;
    const nextLevel = level * 100;
    const bar =
      "█".repeat(Math.floor((xp / nextLevel) * 10)) +
      "░".repeat(10 - Math.floor((xp / nextLevel) * 10));

    await msg.reply(`🎮 *Level ${level}*\n\n${bar} (${xp}/${nextLevel} XP)`);
  },
});
