import { readFileSync } from "node:fs";
import { config } from "@/config";
import { getUser } from "@/database";
import { sendInteractive } from "@/interactive";
import { commands } from "@/loader";
import { defineCommand } from "@/types";

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
  tools: "🛠️",
  productivity: "📋",
};

export default defineCommand({
  name: "menu",
  description: "Tampilkan daftar command",
  handler: async (sock, msg) => {
    const categories = new Map<string, { title: string; id: string; description: string }[]>();
    for (const cmd of commands.values()) {
      const list = categories.get(cmd.category) || [];
      list.push({
        title: `${config.prefix}${cmd.name}`,
        id: `${config.prefix}${cmd.name}`,
        description: cmd.description || "No description",
      });
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
    caption += `_Silakan klik tombol di bawah untuk melihat daftar command._`;

    const sections = [];
    const sorted = Array.from(categories.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    for (const [category, cmds] of sorted) {
      const icon = categoryIcons[category] || "📂";
      sections.push({
        title: `${icon} ${category.toUpperCase()}`,
        rows: cmds,
      });
    }

    try {
      await sendInteractive(sock, msg.jid, {
        body: caption,
        footer: "SeaaveyBot Open Source",
        header: {
          image: readFileSync("src/assets/thumbnail.jpg"),
        },
        buttons: [
          {
            name: "single_select",
            params: {
              title: "Daftar Command",
              sections: sections,
            },
          },
          {
            name: "cta_url",
            params: {
              display_text: "Source Code",
              url: "https://github.com/seaavey/seaavey-bot",
            },
          },
        ],
        mentions: [msg.sender],
      });
    } catch {
      await msg.reply("❌ Gagal mengirim menu.");
    }
  },
});
