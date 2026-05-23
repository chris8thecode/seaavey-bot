import type { AnyMessageContent, proto, WAMessage, WASocket } from "baileys";
import { config } from "@/core/config";
import { getCachedGroupMetadata } from "@/infra/cache/group-metadata-cache";

export interface ParsedMessage {
  id: string | undefined;
  jid: string;
  lid: string;
  sender: string;
  body: string;
  isGroup: boolean;
  isAdmin: boolean;
  isBotAdmin: boolean;
  fromMe: boolean;
  isOwner: boolean;
  mentioned: string[];
  quoted: string | undefined;
  args: string[];
  msg: WAMessage;
  reply: (text: string) => Promise<void>;
  send: (content: AnyMessageContent) => Promise<void>;
}

function extractBody(m: proto.IMessage | null | undefined): string {
  if (m?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
    try {
      const params = JSON.parse(m.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
      if (params.id) return params.id;
    } catch {}
  }
  return (
    m?.conversation ||
    m?.extendedTextMessage?.text ||
    m?.imageMessage?.caption ||
    m?.videoMessage?.caption ||
    m?.templateButtonReplyMessage?.selectedId ||
    ""
  );
}

export async function resolveMessage(sock: WASocket, msg: WAMessage): Promise<ParsedMessage> {
  const key = msg.key;
  const isGroup = !!key.remoteJid?.endsWith("@g.us");
  const jid = key.remoteJid || "";

  const resolveId = async (...ids: (string | undefined | null)[]) => {
    const all = ids.filter((i): i is string => !!i).map((id) => id.replace(/:.+@/, "@"));
    const found = all.find((i) => i.endsWith("@s.whatsapp.net"));
    if (found) return found;
    const lid = all.find((i) => i.endsWith("@lid"));
    if (lid) {
      const resolved = await sock.signalRepository.lidMapping.getPNForLID(lid);
      if (resolved) return resolved.replace(/:.+@/, "@");
    }
    return all[0] || "";
  };

  const senderId = await resolveId(
    key.participantAlt,
    key.participant,
    key.remoteJidAlt,
    key.remoteJid,
  );
  let sender = senderId;

  let isAdmin = false;
  let isBotAdmin = false;

  if (isGroup) {
    const metadata = await getCachedGroupMetadata(sock, jid);
    const participant = metadata.participants.find(
      (p) =>
        p.id.replace(/:.+@/, "@") === senderId ||
        (p.lid && p.lid.replace(/:.+@/, "@") === senderId),
    );

    if (participant) {
      sender = participant.id.replace(/:.+@/, "@");
    }

    isAdmin = !!participant?.admin;
    const botId = sock.user?.id?.replace(/:.+@/, "@") || "";
    const botLid = sock.user?.lid?.replace(/:.+@/, "@") || "";
    isBotAdmin = metadata.participants.some(
      (p) =>
        p.admin &&
        (p.id.replace(/:.+@/, "@") === botId || (p.lid && p.lid.replace(/:.+@/, "@") === botLid)),
    );
  }

  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const mentioned = await Promise.all((contextInfo?.mentionedJid || []).map((id) => resolveId(id)));
  const quoted = contextInfo?.participant
    ? contextInfo.participant.replace(/:.+@/, "@")
    : undefined;
  const body = extractBody(msg.message);
  const args = body.split(" ").slice(1);

  return {
    id: key.id ?? undefined,
    jid: await resolveId(key.remoteJidAlt, key.remoteJid),
    lid: key.remoteJid || "",
    sender,
    body,
    fromMe: !!key.fromMe,
    isGroup,
    isAdmin,
    isBotAdmin,
    isOwner: config.owner.includes(sender.replace(/@.+/, "")),
    mentioned,
    quoted,
    args,
    msg,
    reply: async (text) => {
      const mentions = [...text.matchAll(/@(\d+)/g)].map((m) => `${m[1]}@s.whatsapp.net`);
      await sock.sendMessage(jid, { text, mentions }, { quoted: msg });
    },
    send: async (content) => {
      await sock.sendMessage(jid, content, { quoted: msg });
    },
  };
}
