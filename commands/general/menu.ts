import { readFileSync } from "node:fs";
import { config } from "@/config";
import { getUser } from "@/database";
import { commands } from "@/loader";
import { defineCommand } from "@/types";

const image = readFileSync("assets/thumbnail.jpg");

const categoryIcons: Record<string, string> = {
  general: "⚙️",
  fun: "🎮",
  game: "🎯",
  group: "👥",
  owner: "👑",
  downloader: "📥",
  economy: "💰",
  info: "ℹ️",
  search: "🔍",
};

export default defineCommand({
  name: "menu",
  description: "Tampilkan daftar command",
  handler: async (_sock, msg) => {
    const categories = new Map<string, string[]>();
    for (const cmd of commands.values()) {
      const list = categories.get(cmd.category) || [];
      list.push(`${config.prefix}${cmd.name}`);
      categories.set(cmd.category, list);
    }

    const user = getUser(msg.sender);
    const level = user?.level ?? 1;
    const xp = user?.xp ?? 0;
    const hits = user?.hits ?? 0;
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);

    let caption = `╭━━━━[ *${config.name}* ]━━━━\n`;
    caption += `┃ 👤 @${msg.sender.replace(/@.+/, "")}\n`;
    caption += `┃ 🏆 Level ${level} (${xp} XP)\n`;
    caption += `┃ 📊 Hits: ${hits}\n`;
    caption += `┃ ⏱️ Uptime: ${hours}h ${mins}m\n`;
    caption += `┃ 📦 Total: ${commands.size} commands\n`;
    caption += `╰━━━━━━━━━━━━━━━━\n\n`;

    const sorted = [...categories.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    for (const [category, cmds] of sorted) {
      const icon = categoryIcons[category] || "📂";
      caption += `╭━━━[ ${icon} *${category.toUpperCase()}* ]━━━\n`;
      for (const cmd of cmds) {
        caption += `┃ ◦ ${cmd}\n`;
      }
      caption += `╰━━━━━━━━━━━━━━━━\n\n`;
    }

    caption += `_Ketik ${config.prefix}<command> untuk menggunakan._`;

    await msg.send({ image, caption, mentions: [msg.sender] });
  },
});
