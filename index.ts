import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import type { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  proto,
  useMultiFileAuthState,
  type WAMessage,
} from "baileys";
import QRCode from "qrcode";
import { config } from "@/config";
import db, { addHit, getGroup, isBanned, updateMemberChat } from "@/database";
import { parseMessage } from "@/helper";
import { commands, loadCommands } from "@/loader";
import { logger } from "@/logger";

const isDev = process.env.NODE_ENV !== "production";

async function startBot() {
  await loadCommands();

  const isRegistered = existsSync("auth/creds.json");
  let pairingNumber: string | undefined;

  if (!isRegistered) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    pairingNumber = await new Promise<string>((r) =>
      rl.question("Masukkan nomor WhatsApp (contoh: 62123456789): ", r),
    );
    rl.close();
  }

  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const sock = makeWASocket({ auth: state, logger });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      if (pairingNumber) {
        const code = await sock.requestPairingCode(pairingNumber);
        logger.info(`Pairing code: ${code}`);
      } else {
        await QRCode.toFile("qr.png", qr);
        logger.info("QR code saved to qr.png");
      }
    }

    if (connection === "close") {
      const error = lastDisconnect?.error as Boom | undefined;
      const shouldReconnect = error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
      else logger.info("Logged out.");
    } else if (connection === "open") {
      logger.info("Connected to WhatsApp!");
    }
  });

  sock.ev.on("groups.upsert", async (groups) => {
    for (const group of groups) {
      const jid = group.id;
      for (const p of group.participants) {
        updateMemberChat(jid, p.phoneNumber || p.id);
      }
      logger.info(`Registered ${group.participants.length} members from ${group.subject}`);
    }
  });

  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    if (action === "add" || action === "remove") {
      for (const p of participants) {
        const jid = p.phoneNumber || p.id;
        if (action === "add") {
          updateMemberChat(id, jid);
        } else {
          db.run("DELETE FROM group_members WHERE groupJid = ? AND memberJid = ?", [id, jid]);
        }
      }
    }
  });

  // Message store for antidelete (TTL: 10 minutes)
  const messageStore = new Map<string, WAMessage>();
  const MSG_TTL = 10 * 60 * 1000;

  setInterval(() => {
    const now = Date.now();
    for (const [id, msg] of messageStore) {
      const ts = (msg.messageTimestamp as number) * 1000;
      if (now - ts > MSG_TTL) messageStore.delete(id);
    }
  }, 60_000);

  sock.ev.on("messages.update", async (updates) => {
    for (const { key, update } of updates) {
      if (!key.remoteJid || !key.id) continue;
      if (update.messageStubType !== proto.WebMessageInfo.StubType.REVOKE) continue;

      const jid = key.remoteJid;
      const isGroup = jid.endsWith("@g.us");
      if (!isGroup) continue;

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

      const text = `🚫 *Anti-Delete Detected*\n\n👤 @${sender.replace(/@.+/, "")}\n💬 ${body || "[media]"}`;

      await sock.sendMessage(jid, { text, mentions: [sender] });

      // Forward media if exists
      if (stored.message.imageMessage) {
        await sock.sendMessage(jid, { forward: stored });
      } else if (stored.message.videoMessage) {
        await sock.sendMessage(jid, { forward: stored });
      } else if (stored.message.documentMessage) {
        await sock.sendMessage(jid, { forward: stored });
      } else if (stored.message.audioMessage) {
        await sock.sendMessage(jid, { forward: stored });
      } else if (stored.message.stickerMessage) {
        await sock.sendMessage(jid, { forward: stored });
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key.fromMe) continue;

      // Store message for antidelete
      if (msg.key.id) {
        messageStore.set(msg.key.id, msg);
      }

      if (isDev) writeFile("message.txt", JSON.stringify(msg, null, 2));
      const parse = await parseMessage(sock, msg);

      if (parse.isGroup) {
        updateMemberChat(parse.jid, parse.sender);

        // Auto-register semua member kalau group belum ada data
        const count = db
          .query("SELECT COUNT(*) as c FROM group_members WHERE groupJid = ?")
          .get(parse.jid) as { c: number };
        if (count.c <= 1) {
          const metadata = await sock.groupMetadata(parse.jid);
          for (const p of metadata.participants) {
            updateMemberChat(parse.jid, p.phoneNumber || p.id);
          }
        }
      }

      let cmdName: string | undefined;
      if (parse.body.startsWith("=> ") || parse.body === "=>") {
        cmdName = "=>";
      } else if (parse.body.startsWith("> ") || parse.body === ">") {
        cmdName = ">";
      } else if (parse.body.startsWith(config.prefix)) {
        [cmdName] = parse.body.slice(config.prefix.length).split(" ");
      }

      if (!cmdName) continue;
      if (isBanned(parse.sender)) continue;
      if (parse.isGroup && getGroup(parse.jid).mute && !parse.isAdmin) continue;
      const cmd = commands.get(cmdName);
      if (cmd) {
        addHit(parse.sender);
        cmd.handler(sock, parse).catch((e) => logger.error(e));
      }
    }
  });
}

startBot();
