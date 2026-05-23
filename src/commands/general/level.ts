import { logger } from "@/core/logger";
import { defineCommand } from "@/core/types";
import { getUser } from "@/infra/database";
import { getNumber, getProfilePictureUrl } from "@/utils/helper";
export default defineCommand({
  name: "Level",
  alias: ["lvl", "level"],
  description: "Cek level dan XP kamu",
  handler: async (sock, msg) => {
    const user = getUser(msg.sender);
    const level = user?.level ?? 1;
    const xp = user?.xp ?? 0;
    const nextLevel = level * 100;

    try {
      const { generateRankCard } = await import("@/canvas/rankCard");
      const ppUrl = await getProfilePictureUrl(sock, msg.sender);

      const userName = msg.pushName || getNumber(msg.sender);
      const imageBuffer = await generateRankCard(ppUrl, userName, level, xp, nextLevel);

      await sock.sendMessage(
        msg.jid,
        {
          image: imageBuffer,
          caption: `🎮 *Level ${level}* (${xp}/${nextLevel} XP)`,
        },
        { quoted: msg.raw },
      );
    } catch (e) {
      logger.error(e);
      const bar =
        "█".repeat(Math.floor((xp / nextLevel) * 10)) +
        "░".repeat(10 - Math.floor((xp / nextLevel) * 10));
      await msg.reply(`🎮 *Level ${level}*\n\n${bar} (${xp}/${nextLevel} XP)`);
    }
  },
});
