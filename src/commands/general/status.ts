import { freemem, totalmem } from "node:os";
import { formatSize, formatTime } from "@/utils/helper";
import { defineCommand } from "@/core/types";

const startTime = Date.now();

export default defineCommand({
  name: "status",
  description: "Cek status server dan bot",
  handler: async (_sock, msg) => {
    const uptime = formatTime((Date.now() - startTime) / 1000);
    const totalMem = totalmem();
    const freeMem = freemem();
    const usedMem = totalMem - freeMem;

    let text = `🖥️ *Server Status*\n\n`;
    text += `⏱️ *Uptime:* ${uptime}\n`;
    text += `💾 *RAM:* ${formatSize(usedMem)} / ${formatSize(totalMem)}\n`;
    text += `⚙️ *Platform:* ${process.platform}\n`;
    text += `📦 *NodeJS:* ${process.version}\n`;

    await msg.reply(text.trim());
  },
});
