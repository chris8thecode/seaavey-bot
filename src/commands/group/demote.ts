import { defineCommand } from "@/core/types";
import { getNumber } from "@/utils/helper";
export default defineCommand({
  name: "Demote",
  alias: ["dmt", "demote"],
  description: "Hapus admin dari member",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply("Tag atau reply user yang mau di demote!");
    await sock.groupParticipantsUpdate(msg.jid, [target], "demote");
    await msg.send({
      text: `Done, @${getNumber(target)} telah dicopot dari admin!`,
      mentions: [target],
    });
  },
});
