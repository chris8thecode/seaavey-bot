import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Link",
  alias: ["link"],
  description: t("group.link.description"),
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    const code = await sock.groupInviteCode(msg.jid);
    await msg.reply(`https://chat.whatsapp.com/${code}`);
  },
});
