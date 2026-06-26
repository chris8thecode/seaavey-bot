import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "List Group",
  alias: ["lg", "groups", "listgroup"],
  description: t("owner.listgroup.desc"),
  ownerOnly: true,
  handler: async (sock, msg) => {
    const groups = await sock.groupFetchAllParticipating();
    const list = Object.values(groups)
      .map((g, i) => `${i + 1}. ${g.subject} (${g.participants.length} members)`)
      .join("\n");

    await msg.reply(t("owner.listgroup.title", { count: Object.keys(groups).length, list }));
  },
});
