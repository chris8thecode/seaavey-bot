import { readFileSync } from "node:fs";
import { generateMessageID, prepareWAMessageMedia, proto } from "baileys";
import sharp from "sharp";
import { config } from "@/config";
import { getUser } from "@/database";
import { commands } from "@/loader";
import { defineCommand } from "@/types";

const image = readFileSync("src/assets/thumbnail.jpg");

const categoryIcons: Record<string, string> = {
  general: "⚙️",
  fun: "🎮",
  game: "🎯",
  group: "👥",
  owner: "👑",
  downloader: "📥",
  economy: "💰",
  info: "ℹ️",
  search: "🔍",
  tools: "🛠️",
  productivity: "📋",
};

export default defineCommand({
  name: "menu",
  description: "Tampilkan daftar command",
  handler: async (sock, msg) => {
    const categories = new Map<string, string[]>();
    for (const cmd of commands.values()) {
      const list = categories.get(cmd.category) || [];
      list.push(`${config.prefix}${cmd.name}`);
      categories.set(cmd.category, list);
    }

    const user = getUser(msg.sender);
    const level = user?.level ?? 1;
    const xp = user?.xp ?? 0;
    const hits = user?.hits ?? 0;
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);

    let caption = `╭━━━━[ *${config.name}* ]━━━━\n`;
    caption += `┃ 👤 @${msg.sender.replace(/@.+/, "")}\n`;
    caption += `┃ 🏆 Level ${level} (${xp} XP)\n`;
    caption += `┃ 📊 Hits: ${hits}\n`;
    caption += `┃ ⏱️ Uptime: ${hours}h ${mins}m\n`;
    caption += `┃ 📦 Total: ${commands.size} commands\n`;
    caption += `╰━━━━━━━━━━━━━━━━\n\n`;

    const sorted = Array.from(categories.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    for (const [category, cmds] of sorted) {
      const icon = categoryIcons[category] || "📂";
      caption += `╭━━━[ ${icon} *${category.toUpperCase()}* ]━━━\n`;
      for (const cmd of cmds) caption += `┃ ◦ ${cmd}\n`;
      caption += `╰━━━━━━━━━━━━━━━━\n\n`;
    }

    caption += `_Ketik ${config.prefix}<command> untuk menggunakan._`;

    try {
      const miniPreview = await sharp(image)
        .resize(90, 90, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toBuffer();

      const uploaded = await prepareWAMessageMedia(
        { image },
        { upload: sock.waUploadToServer, mediaTypeOverride: "thumbnail-link" },
      );

      const img = uploaded?.imageMessage;
      const message: proto.IMessage = {
        extendedTextMessage: proto.Message.ExtendedTextMessage.create({
          text: `https://github.com/seaavey/seaavey-bot\n\n${caption}`,
          matchedText: "https://github.com/seaavey/seaavey-bot",
          title: config.name,
          description: "Open Source WhatsApp Bot",
          previewType: 0,
          jpegThumbnail: miniPreview,
          mediaKeyTimestamp: Math.floor(Date.now() / 1000),
          inviteLinkGroupTypeV2: 0,
          ...(img && {
            thumbnailDirectPath: img.directPath,
            thumbnailSha256: img.fileSha256,
            thumbnailEncSha256: img.fileEncSha256,
            mediaKey: img.mediaKey,
            thumbnailHeight: img.height,
            thumbnailWidth: img.width,
          }),
          contextInfo: {
            mentionedJid: [msg.sender],
            stanzaId: msg.msg.key.id ?? null,
            participant: msg.msg.key.participant || msg.msg.key.remoteJid || null,
            quotedMessage: msg.msg.message ?? null,
          },
        }),
      };

      await sock.relayMessage(msg.jid, message, {
        messageId: generateMessageID(),
      });
    } catch {
      await msg.reply("❌ Gagal mengirim menu.");
    }
  },
});
