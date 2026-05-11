import db, { getSiders } from "@/database";
import { defineCommand } from "@/types";

export default defineCommand({
  name: "sider",
  description: "List member yang tidak chat selama 3+ hari",
  handler: async (sock, msg) => {
    if (!msg.isGroup) return msg.reply("❌ Hanya bisa digunakan di group.");
    if (!msg.isAdmin) return msg.reply("❌ Hanya admin yang bisa menggunakan command ini.");

    const days = Number(msg.args[0]) || 3;
    const metadata = await sock.groupMetadata(msg.jid);
    const allMembers = metadata.participants.map((p) => p.id);

    // Member yang tercatat tapi sudah lama tidak chat
    const inactive = getSiders(msg.jid, days).map((s) => s.memberJid);

    // Member yang belum pernah tercatat di DB (belum pernah chat sejak bot aktif)
    const tracked = db
      .query("SELECT memberJid FROM group_members WHERE groupJid = ?")
      .all(msg.jid) as { memberJid: string }[];
    const trackedSet = new Set(tracked.map((t) => t.memberJid));
    const neverChatted = allMembers.filter((m) => !trackedSet.has(m));

    const allSiders = [...new Set([...inactive, ...neverChatted])];

    if (!allSiders.length) {
      return msg.reply(`✅ Tidak ada sider! Semua member aktif dalam ${days} hari terakhir.`);
    }

    const list = allSiders.map((jid, i) => `${i + 1}. @${jid.replace(/@.+/, "")}`).join("\n");

    await msg.send({
      text: `🚶 *Daftar Sider (${days} hari)*\nTotal: ${allSiders.length}/${allMembers.length} member\n\n${list}`,
      mentions: allSiders,
    });
  },
});
