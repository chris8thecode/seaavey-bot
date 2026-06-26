import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Mute",
  alias: ["mute"],
  description: t("group.mute.description"),
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    await sock.groupSettingUpdate(msg.jid, "announcement");
    await msg.reply(t("group.mute.done"));
  },
});
