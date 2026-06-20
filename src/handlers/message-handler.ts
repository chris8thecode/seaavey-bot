import { appendFile, writeFile } from "node:fs/promises";
import { proto, type WAMessage, type WASocket } from "baileys";

import { isDev } from "@/core/config";
import { dispatchCommand } from "@/handlers/command-dispatcher";
import type { MessageContext } from "@/handlers/message-context";
import db from "@/infra/client";
import { getCachedGroupMetadata } from "@/infra/group-metadata-cache";
import { getGroup, updateMemberChat } from "@/infra/repositories/group-repo";
import { runMiddlewares } from "@/middleware";
import { getNumber } from "@/utils/helper";
import { resolveMessage } from "@/utils/message-resolver";
import { TtlMap } from "@/utils/ttl-map";

const messageStore = new TtlMap<string, WAMessage>(10 * 60 * 1000);

export async function handleMessagesUpsert(sock: WASocket, messages: WAMessage[]) {
  for (const msg of messages) {
    if (msg.key.fromMe) continue;

    if (msg.key.id) messageStore.set(msg.key.id, msg);

    const parse = await resolveMessage(sock, msg);

    // For development purposes, store the raw message data and group participantship in the "dev" folder. This can be helpful for debugging and testing.
    if (isDev) {
      // Store the parsed message data to a JSON file for easier debugging and analysis of the message structure and content.
      await writeFile("dev/parsed-message.json", JSON.stringify(parse, null, 2));

      // Store group participant data to a JSON file for easier debugging of group-related features.
      await sock.groupFetchAllParticipating().then((groups) => {
        writeFile("dev/group-participants.json", JSON.stringify(groups, null, 2));
      });

      // Append the raw message data to a history file for later analysis. This can help track message patterns and debug issues that may arise.
      await appendFile(
        "dev/history-message.txt",
        `${JSON.stringify(msg, null, 2)}\n\n${"-".repeat(50)}\n\n`,
      );

      // Store the raw message data to a separate file for quick access and debugging of individual messages.
      await writeFile("dev/message.txt", JSON.stringify(msg, null, 2));
    }

    if (parse.isGroup) {
      updateMemberChat(parse.jid, parse.sender);
      const group = getGroup(parse.jid);

      const count = db
        .query("SELECT COUNT(*) as c FROM group_members WHERE groupJid = ?")
        .get(parse.jid) as { c: number };
      if (count.c <= 1) {
        const metadata = await getCachedGroupMetadata(sock, parse.jid);
        for (const p of metadata.participants) {
          updateMemberChat(parse.jid, p.phoneNumber || p.id);
        }
      }

      const ctx: MessageContext = { sock, raw: msg, parse, group };
      const result = await runMiddlewares(ctx);
      if (result === "stop") continue;
    } else {
      const ctx: MessageContext = { sock, raw: msg, parse };
      const result = await runMiddlewares(ctx);
      if (result === "stop") continue;
    }

    await dispatchCommand(sock, parse);
  }
}

export async function handleMessagesUpdate(
  sock: WASocket,
  updates: { key: proto.IMessageKey; update: proto.IWebMessageInfo }[],
) {
  for (const { key, update } of updates) {
    if (!key.remoteJid || !key.id) continue;
    if (update.messageStubType !== proto.WebMessageInfo.StubType.REVOKE) continue;

    const jid = key.remoteJid;
    if (!jid.endsWith("@g.us")) continue;

    const group = getGroup(jid);
    if (!group.antidelete) continue;

    const stored = messageStore.get(key.id);
    if (!stored?.message || !stored.key) continue;

    const sender = stored.key.participant || stored.key.remoteJid || "";
    const body =
      stored.message.conversation ||
      stored.message.extendedTextMessage?.text ||
      stored.message.imageMessage?.caption ||
      stored.message.videoMessage?.caption ||
      "";

    const text = `🚫 *Anti-Delete Detected*\n\n👤 @${getNumber(sender)}\n💬 ${body || "[media]"}`;
    await sock.sendMessage(jid, { text, mentions: [sender] });

    if (
      stored.message.imageMessage ||
      stored.message.videoMessage ||
      stored.message.documentMessage ||
      stored.message.audioMessage ||
      stored.message.stickerMessage
    ) {
      await sock.sendMessage(jid, { forward: stored });
    }
  }
}
