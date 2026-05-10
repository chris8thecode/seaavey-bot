import { config } from "@/config";
import { defineCommand } from "@/types";

export default defineCommand({
  name: "owner",
  description: "Info owner bot",
  handler: async (sock, msg) => {
    await sock.sendMessage(msg.lid, {
      contacts: {
        contacts: [
          {
            displayName: "Owner",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Owner ${config.name}\nTEL;type=CELL:+${config.owner}\nEND:VCARD`,
          },
        ],
      },
    });
  },
});
