import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { AnyMessageContent, proto, WAMessage, WASocket } from "baileys";
import { config } from "@/core/config";
import { logger } from "@/core/logger";

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

export async function parseMessage(sock: WASocket, msg: WAMessage): Promise<ParsedMessage> {
  const key = msg.key;
  const isGroup = !!key.remoteJid?.endsWith("@g.us");
  const jid = key.remoteJid || "";

  const cleanId = (id: string) => id.replace(/:.+@/, "@");

  const resolveId = (...ids: (string | undefined | null)[]) => {
    const all = ids.filter((i): i is string => !!i).map(cleanId);
    return all.find((i) => i.endsWith("@s.whatsapp.net")) || all[0] || "";
  };

  const senderId = resolveId(key.participantAlt, key.participant, key.remoteJidAlt, key.remoteJid);
  let sender = senderId;

  let isAdmin = false;
  let isBotAdmin = false;

  if (isGroup) {
    const metadata = await sock.groupMetadata(jid);
    const participant = metadata.participants.find(
      (p) => cleanId(p.id) === senderId || (p.lid && cleanId(p.lid) === senderId),
    );

    if (participant) {
      sender = cleanId(participant.id);
    }

    isAdmin = !!participant?.admin;
    const botId = cleanId(sock.user?.id || "");
    const botLid = cleanId(sock.user?.lid || "");
    isBotAdmin = metadata.participants.some(
      (p) => p.admin && (cleanId(p.id) === botId || (p.lid && cleanId(p.lid) === botLid)),
    );
  }

  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const mentioned = (contextInfo?.mentionedJid || []).map(cleanId);
  const quoted = contextInfo?.participant ? cleanId(contextInfo.participant) : undefined;
  const body = extractBody(msg.message);
  const args = body.split(" ").slice(1);

  return {
    id: key.id ?? undefined,
    jid: resolveId(key.remoteJidAlt, key.remoteJid),
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

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getNumber(jid: string): string {
  return jid.replace(/@.+/, "");
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h > 0 ? `${h} jam ` : ""}${m > 0 ? `${m} menit ` : ""}${s} detik`;
}

const GAMES_DATA_DIR = join(process.cwd(), "src", "data", "games");

export async function getProfilePictureUrl(sock: WASocket, jid: string): Promise<string | null> {
  try {
    return (await sock.profilePictureUrl(jid, "image")) ?? null;
  } catch {
    return null;
  }
}

export function loadGameData<T>(filename: string): T[] {
  try {
    const raw = readFileSync(join(GAMES_DATA_DIR, filename), "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    logger.error(`Failed to load ${filename}`);
    return [];
  }
}
