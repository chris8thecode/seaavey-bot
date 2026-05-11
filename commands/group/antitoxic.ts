import { getGroup, setGroup } from "@/database";
import { defineCommand } from "@/types";

export default defineCommand({
  name: "antitoxic",
  description: "Toggle antitoxic on/off",
  handler: async (_sock, msg) => {
    if (!msg.isGroup) return msg.reply("❌ Hanya bisa digunakan di group.");
    if (!msg.isAdmin) return msg.reply("❌ Hanya admin yang bisa menggunakan command ini.");

    const group = getGroup(msg.jid);
    const newVal = group.antitoxic ? 0 : 1;
    setGroup(msg.jid, "antitoxic", newVal);
    await msg.reply(`✅ Antitoxic ${newVal ? "diaktifkan" : "dinonaktifkan"}.`);
  },
});
