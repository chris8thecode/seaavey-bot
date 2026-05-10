import type { AnyMessageContent, proto, WAMessage, WAMessageKey, WASocket } from "baileys";
import { config } from "@/config";

export interface ParsedMessage {
  id: WAMessageKey["id"];
  jid: WAMessageKey["remoteJidAlt"];
  lid: WAMessageKey["remoteJid"];
  sender: WAMessageKey["remoteJidAlt"];
  body: string;
  isGroup: boolean;
  fromMe: boolean;
  isOwner: boolean;
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

export function parseMessage(sock: WASocket, msg: WAMessage): ParsedMessage {
  const sender = msg.key.participant || msg.key.remoteJidAlt;
  const isGroup = !!msg.key.remoteJid?.endsWith("@g.us");
  const key = msg.key;
  const jid = key.remoteJidAlt;

  return {
    id: key.id,
    jid,
    lid: key.remoteJid,
    sender,
    body: extractBody(msg.message),
    fromMe: !!msg.key.fromMe,
    isGroup,
    isOwner: sender?.replace(/@.+/, "") === config.owner,
    reply: async (text) => {
      await sock.sendMessage(jid as string, { text }, { quoted: msg });
    },
    send: async (content) => {
      await sock.sendMessage(jid as string, content, { quoted: msg });
    },
  };
}
