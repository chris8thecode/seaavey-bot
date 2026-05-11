import { readFileSync } from "node:fs";
import { config } from "@/config";
import { getUser } from "@/database";
import { commands } from "@/loader";
import { defineCommand } from "@/types";

const thumbnail = readFileSync("assets/banner.png");

export default defineCommand({
  name: "menu",
  description: "Tampilkan daftar command",
  handler: async (_sock, msg) => {
    const categories = new Map<string, string[]>();
    for (const cmd of commands.values()) {
      const list = categories.get(cmd.category) || [];
      list.push(`• ${config.prefix}${cmd.name}`);
      categories.set(cmd.category, list);
    }

    let text = `╭─── *${config.name}* ───\n│\n│ Hits: ${getUser(msg.sender)?.hits ?? 0}\n│\n`;
    for (const [category, cmds] of categories) {
      text += `│ *「 ${category.toUpperCase()} 」*\n`;
      for (const cmd of cmds) {
        text += `│ ${cmd}\n`;
      }
      text += `│\n`;
    }
    text += `╰────────────────`;

    await msg.send({ image: thumbnail, caption: text });
  },
});
