import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Unlock",
  alias: ["ul", "unlock"],
  description: t("group.unlock.description"),
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    await sock.groupSettingUpdate(msg.jid, "unlocked");
    await msg.reply(t("group.unlock.done"));
  },
});
