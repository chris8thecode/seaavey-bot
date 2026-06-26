import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Leave",
  alias: ["leave"],
  description: t("owner.leave.desc"),
  ownerOnly: true,
  groupOnly: true,
  handler: async (sock, msg) => {
    await msg.reply("👋 Bye!");
    await sock.groupLeave(msg.jid);
  },
});
