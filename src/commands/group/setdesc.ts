import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Set Desc",
  alias: ["sd", "setdesc"],
  description: t("group.setdesc.description"),
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    const desc = msg.args.join(" ");
    if (!desc) return msg.reply(t("group.setdesc.noDesc"));
    await sock.groupUpdateDescription(msg.jid, desc);
    await msg.reply(t("group.setdesc.done"));
  },
});
