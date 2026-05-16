import { commands } from "@/loader";
import { defineCommand } from "@/types";

export default defineCommand({
  name: "totalfitur",
  description: "Hitung total command yang tersedia",
  handler: async (_sock, msg) => {
    await msg.reply(`📊 Total fitur: *${commands.size}* command`);
  },
});
