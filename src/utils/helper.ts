     1|import { readFileSync } from "node:fs";
     2|import { join } from "node:path";
     3|import type { AnyMessageContent, proto, WAMessage, WASocket } from "baileys";
     4|import { config } from "@/core/config";
     5|import { logger } from "@/core/logger";
     6|
     7|export interface ParsedMessage {
     8|  id: string | undefined;
     9|  jid: string;
    10|  lid: string;
    11|  sender: string;
    12|  body: string;
    13|  isGroup: boolean;
    14|  isAdmin: boolean;
    15|  isBotAdmin: boolean;
    16|  fromMe: boolean;
    17|  isOwner: boolean;
    18|  mentioned: string[];
    19|  quoted: string | undefined;
    20|  args: string[];
    21|  msg: WAMessage;
    22|  reply: (text: string) => Promise<void>;
    23|  send: (content: AnyMessageContent) => Promise<void>;
    24|}
    25|
    26|function extractBody(m: proto.IMessage | null | undefined): string {
    27|  if (m?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
    28|    try {
    29|      const params = JSON.parse(m.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
    30|      if (params.id) return params.id;
    31|    } catch {}
    32|  }
    33|  return (
    34|    m?.conversation ||
    35|    m?.extendedTextMessage?.text ||
    36|    m?.imageMessage?.caption ||
    37|    m?.videoMessage?.caption ||
    38|    m?.templateButtonReplyMessage?.selectedId ||
    39|    ""
    40|  );
    41|}
    42|
    43|export async function parseMessage(sock: WASocket, msg: WAMessage): Promise<ParsedMessage> {
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
}\n\nexport function getRandomItem<T>(arr: T[]): T {
   106|  return arr[Math.floor(Math.random() * arr.length)] as T;
   107|}
   108|
   109|export function getRandomNumber(min: number, max: number): number {
   110|  return Math.floor(Math.random() * (max - min + 1)) + min;
   111|}
   112|
   113|export function getNumber(jid: string): string {
   114|  return jid.replace(/@.+/, "");
   115|}
   116|
   117|export function formatSize(bytes: number): string {
   118|  if (bytes === 0) return "0 B";
   119|  const k = 1024;
   120|  const sizes = ["B", "KB", "MB", "GB", "TB"];
   121|  const i = Math.floor(Math.log(bytes) / Math.log(k));
   122|  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
   123|}
   124|
   125|export function formatTime(ms: number): string {
   126|  const seconds = Math.floor(ms / 1000);
   127|  const h = Math.floor(seconds / 3600);
   128|  const m = Math.floor((seconds % 3600) / 60);
   129|  const s = Math.floor(seconds % 60);
   130|  return `${h > 0 ? `${h} jam ` : ""}${m > 0 ? `${m} menit ` : ""}${s} detik`;
   131|}
   132|
   133|const GAMES_DATA_DIR = join(process.cwd(), "src", "data", "games");
   134|
   135|export async function getProfilePictureUrl(sock: WASocket, jid: string): Promise<string | null> {
   136|  try {
   137|    return (await sock.profilePictureUrl(jid, "image")) ?? null;
   138|  } catch {
   139|    return null;
   140|  }
   141|}
   142|
   143|export function loadGameData<T>(filename: string): T[] {
   144|  try {
   145|    const raw = readFileSync(join(GAMES_DATA_DIR, filename), "utf-8");
   146|    return JSON.parse(raw) as T[];
   147|  } catch {
   148|    logger.error(`Failed to load ${filename}`);
   149|    return [];
   150|  }
   151|}
   152|