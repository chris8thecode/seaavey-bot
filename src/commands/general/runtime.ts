import { defineCommand } from "@/core/types";
import { formatTime } from "@/utils/helper";

const startTime = Date.now();

export default defineCommand({
  name: "Runtime",
  description: "Lihat uptime bot",
  handler: async (_sock, msg) => {
    const ms = Date.now() - startTime;
    await msg.reply(`⏱️ Uptime: ${formatTime(ms / 1000)}`);
  },
});
