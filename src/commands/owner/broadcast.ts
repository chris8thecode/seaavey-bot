import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";

export default defineCommand({
  name: "Broadcast",
  alias: ["bc", "broadcast"],
  description: t("owner.broadcast.desc"),
  ownerOnly: true,
  handler: async (sock, msg) => {
    if (!msg.args.length) return msg.reply(t("owner.broadcast.format"));

    const text = msg.args.join(" ");
    const groups = await sock.groupFetchAllParticipating();
    const jids = Object.keys(groups);

    for (const jid of jids) {
      await sock.sendMessage(jid, { text: `📢 *Broadcast*\n\n${text}` });
    }

    await msg.reply(t("owner.broadcast.sent", { count: String(jids.length) }));
  },
});
