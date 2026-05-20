import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Ping",
  alias: ["ping"],
  description: "Cek kecepatan respon bot",
  handler: async (_sock, msg) => {
    const start = Date.now();
    await msg.reply(`🏓 Pong! ${Date.now() - start}ms`);
  },
});
