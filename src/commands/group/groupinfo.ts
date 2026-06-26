import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Group Info",
  alias: ["ginfo", "groupinfo"],
  description: t("group.groupinfo.description"),
  groupOnly: true,
  handler: async (sock, msg) => {
    const metadata = await sock.groupMetadata(msg.jid);
    const admins = metadata.participants.filter((p) => p.admin);
    const creationDate = new Date((metadata.creation || 0) * 1000).toLocaleDateString("id-ID");
    const text = [
      `*${metadata.subject}*`,
      t("group.groupinfo.id", { id: metadata.id }),
      t("group.groupinfo.created", { date: creationDate }),
      t("group.groupinfo.members", { count: metadata.participants.length }),
      t("group.groupinfo.admins", { count: admins.length }),
      t("group.groupinfo.desc", { desc: metadata.desc || "-" }),
    ].join("\n");
    await msg.reply(text);
  },
});
