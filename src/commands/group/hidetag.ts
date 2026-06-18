import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Hide Tag",
  alias: ["ht", "hidetag"],
  description: "Tag semua member tanpa mention visible",
  groupOnly: true,
  adminOnly: true,
  handler: async (sock, msg) => {
    const metadata = await sock.groupMetadata(msg.jid);
    const participants = metadata.participants.map((p) => p.id);
    const text = msg.args.join(" ") || "‎";
    await sock.sendMessage(msg.jid, { text, mentions: participants });
  },
});
