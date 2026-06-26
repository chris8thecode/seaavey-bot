import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Set Name",
  command: "gsetname",
  description: t("group.setname.description"),
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    const name = msg.args.join(" ");
    if (!name) return msg.reply(t("group.setname.noName"));
    await sock.groupUpdateSubject(msg.jid, name);
    await msg.reply(t("group.setname.done", { name }));
  },
});
