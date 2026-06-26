import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Unmute",
  alias: ["um", "unmute"],
  description: t("group.unmute.description"),
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    await sock.groupSettingUpdate(msg.jid, "not_announcement");
    await msg.reply(t("group.unmute.done"));
  },
});
