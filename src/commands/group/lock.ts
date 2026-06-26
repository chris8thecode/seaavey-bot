import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Lock",
  alias: ["lock"],
  description: t("group.lock.description"),
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    await sock.groupSettingUpdate(msg.jid, "locked");
    await msg.reply(t("group.lock.done"));
  },
});
