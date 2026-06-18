import type { WASocket } from "baileys";
import { defineCommand } from "@/core/types";
import { getNumber } from "@/utils/helper";

const votes = new Map<string, { target: string; voters: Set<string>; timeout: Timer }>();

function getSession(key: string, target: string, sock: WASocket, jid: string) {
  let session = votes.get(key);
  if (session) return session;

  const timeout = setTimeout(() => {
    votes.delete(key);
    sock.sendMessage(jid, {
      text: `⏰ Votekick @${getNumber(target)} expired.`,
      mentions: [target],
    });
  }, 300_000);

  session = { target, voters: new Set(), timeout };
  votes.set(key, session);
  return session;
}

export default defineCommand({
  name: "Vote Kick",
  alias: ["vk", "votekick"],
  description: "Vote untuk kick member. Butuh 5 vote.",
  groupOnly: true,
  botAdmin: true,
  handler: async (sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender;
    if (!target) return msg.reply("Tag user yang ingin di-votekick.\nContoh: .votekick @user");
    if (target === msg.sender) return msg.reply("❌ Gak bisa votekick diri sendiri.");

    const key = `${msg.jid}:${target}`;
    const session = getSession(key, target, sock, msg.jid);

    if (session.voters.has(msg.sender)) return msg.reply("❌ Kamu sudah vote!");
    session.voters.add(msg.sender);
    const needed = 5;

    if (session.voters.size >= needed) {
      clearTimeout(session.timeout);
      votes.delete(key);
      await sock.groupParticipantsUpdate(msg.jid, [target], "remove");
      return msg.send({
        text: `🗳️ *Votekick Berhasil!*\n\n@${getNumber(target)} dikick (${needed}/${needed} vote)`,
        mentions: [target],
      });
    }

    await msg.send({
      text: `🗳️ *Votekick*\n\n@${getNumber(target)} — ${session.voters.size}/${needed} vote\n\nKetik .votekick @${getNumber(target)} untuk vote!`,
      mentions: [target],
    });
  },
});
