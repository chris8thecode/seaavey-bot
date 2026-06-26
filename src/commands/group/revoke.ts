import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Revoke",
  alias: ["rev", "revoke"],
  description: t("group.revoke.description"),
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    await sock.groupRevokeInvite(msg.jid);
    await msg.reply(t("group.revoke.done"));
  },
});
