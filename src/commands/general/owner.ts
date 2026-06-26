import { config } from "@/core/config";
import { defineCommand } from "@/core/types";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Owner",
  alias: ["own", "owner"],
  description: t("general.owner.desc"),
  handler: async (sock, msg) => {
    await sock.sendMessage(msg.jid, {
      contacts: {
        contacts: config.owner.map((num, i) => ({
          displayName: `Owner ${i + 1}`,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Owner ${config.name}\nTEL;type=CELL:+${num}\nEND:VCARD`,
        })),
      },
    });
  },
});
