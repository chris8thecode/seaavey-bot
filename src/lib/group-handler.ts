import type { WASocket } from "baileys";
import db, { getGroup, updateMemberChat } from "@/database";
import { logger } from "@/logger";

export async function handleGroupParticipants(
  sock: WASocket,
  { id, participants, action }: { id: string; participants: string[]; action: string },
) {
  if (action !== "add" && action !== "remove") return;

  const group = getGroup(id);

  for (const p of participants) {
    const jid = `${p.replace(/@.+/, "")}@s.whatsapp.net`;
    if (action === "add") {
      updateMemberChat(id, jid);
    } else {
      db.run("DELETE FROM group_members WHERE groupJid = ? AND memberJid = ?", [id, jid]);
    }
  }

  const mentions = participants;
  const tags = mentions.map((m) => `@${m.replace(/@.+/, "")}`).join(", ");

  // Welcome
  if (action === "add" && group.welcome) {
    try {
      const { generateWelcomeImage } = await import("@canvas/welcomeImage");
      const metadata = await sock.groupMetadata(id);
      for (const m of mentions) {
        let ppUrl: string | null = null;
        try {
          ppUrl = (await sock.profilePictureUrl(m, "image")) ?? null;
        } catch {}
        const imageBuffer = await generateWelcomeImage(
          ppUrl,
          m.replace(/@.+/, ""),
          metadata.subject,
        );
        await sock.sendMessage(id, {
          image: imageBuffer,
          caption: `👋 Welcome @${m.replace(/@.+/, "")}! Semoga betah di group ini.`,
          mentions: [m],
        });
      }
    } catch (e) {
      logger.error(e);
      await sock.sendMessage(id, {
        text: `👋 Welcome ${tags}! Semoga betah di group ini.`,
        mentions,
      });
    }
  }

  // Goodbye
  if (action === "remove" && group.goodbye) {
    try {
      const { generateGoodbyeImage } = await import("@canvas/welcomeImage");
      const metadata = await sock.groupMetadata(id);
      for (const m of mentions) {
        let ppUrl: string | null = null;
        try {
          ppUrl = (await sock.profilePictureUrl(m, "image")) ?? null;
        } catch {}
        const imageBuffer = await generateGoodbyeImage(
          ppUrl,
          m.replace(/@.+/, ""),
          metadata.subject,
        );
        await sock.sendMessage(id, {
          image: imageBuffer,
          caption: `👋 Goodbye @${m.replace(/@.+/, "")}, sampai jumpa lagi.`,
          mentions: [m],
        });
      }
    } catch (e) {
      logger.error(e);
      await sock.sendMessage(id, {
        text: `👋 Goodbye ${tags}, sampai jumpa lagi.`,
        mentions,
      });
    }
  }
}
