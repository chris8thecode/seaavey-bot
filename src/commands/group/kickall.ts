import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

const pending = new Set<string>();

export default defineCommand({
  name: "Kick All",
  alias: ["ka", "kickall"],
  description: t("group.kickall.description"),
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    const key = `${msg.jid}:${msg.sender}`;

    if (!pending.has(key)) {
      pending.add(key);
      setTimeout(() => pending.delete(key), 30000);
      return msg.reply(t("group.kickall.confirm"));
    }

    pending.delete(key);

    const metadata = await sock.groupMetadata(msg.jid);
    const members = metadata.participants.filter((p) => !p.admin).map((p) => p.id);

    if (!members.length) return msg.reply(t("group.kickall.noMembers"));

    await msg.reply(t("group.kickall.progress", { count: members.length }));

    for (const member of members) {
      await sock.groupParticipantsUpdate(msg.jid, [member], "remove");
    }

    await msg.reply(t("group.kickall.done", { count: members.length }));
  },
});
