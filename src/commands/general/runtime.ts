import { formatTime } from "@/helper";
import { defineCommand } from "@/types";

const startTime = Date.now();

export default defineCommand({
  name: "runtime",
  description: "Lihat uptime bot",
  handler: async (_sock, msg) => {
    const ms = Date.now() - startTime;
    await msg.reply(`⏱️ Uptime: ${formatTime(ms / 1000)}`);
  },
});
