import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Leave",
  command: "gleave",
  description: t("group.leave.description"),
  groupOnly: true,
  ownerOnly: true,
  handler: async (sock, msg) => {
    await msg.reply(t("group.leave.done"));
    await sock.groupLeave(msg.jid);
  },
});
