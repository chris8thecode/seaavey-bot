import type { AnyMessageContent, proto, WAMessage, WASocket } from "baileys";
import { config } from "@/config";

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
  reply: (text: string) => Promise<void>;
  send: (content: AnyMessageContent) => Promise<void>;
}

function extractBody(m: proto.IMessage | null | undefined): string {
  return (
    m?.conversation ||
    m?.extendedTextMessage?.text ||
    m?.imageMessage?.caption ||
    m?.videoMessage?.caption ||
    ""
  );
}

export async function parseMessage(sock: WASocket, msg: WAMessage): Promise<ParsedMessage> {
  const key = msg.key;
  const isGroup = !!key.remoteJid?.endsWith("@g.us");
  const sender = key.participantAlt || key.participant || key.remoteJidAlt || key.remoteJid;
  const jid = key.remoteJid || "";

  let isAdmin = false;
  let isBotAdmin = false;

  if (isGroup) {
    const metadata = await sock.groupMetadata(jid);
    const adminIds = metadata.participants.filter((p) => p.admin).map((p) => p.id);
    const senderLid = key.participant;
    const senderJid = key.participantAlt;
    isAdmin = adminIds.includes(senderLid || "") || adminIds.includes(senderJid || "");
    const botId = `${sock.user?.id?.replace(/:\d+/, "")}@s.whatsapp.net`;
    const botLid = sock.user?.lid;
    isBotAdmin = adminIds.includes(botId) || adminIds.includes(botLid || "");
  }

  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const mentioned = contextInfo?.mentionedJid || [];
  const quoted = contextInfo?.participant || undefined;
  const body = extractBody(msg.message);
  const args = body.split(" ").slice(1);

  return {
    id: key.id ?? undefined,
    jid: key.remoteJidAlt || key.remoteJid || "",
    lid: key.remoteJid || "",
    sender: sender || "",
    body,
    fromMe: !!key.fromMe,
    isGroup,
    isAdmin,
    isBotAdmin,
    isOwner: (sender?.replace(/@.+/, "") || "") === config.owner,
    mentioned,
    quoted,
    args,
    reply: async (text) => {
      await sock.sendMessage(jid, { text }, { quoted: msg });
    },
    send: async (content) => {
      await sock.sendMessage(jid, content, { quoted: msg });
    },
  };
}
