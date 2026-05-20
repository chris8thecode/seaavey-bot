import { defineCommand } from "@/core/types";
import { commands } from "@/infra/loader";

export default defineCommand({
  name: "Total Fitur",
  alias: ["features"],
  description: "Hitung total command yang tersedia",
  handler: async (_sock, msg) => {
    await msg.reply(`📊 Total fitur: *${commands.size}* command`);
  },
});
