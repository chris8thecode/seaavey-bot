import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import type { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  downloadMediaMessage,
  proto,
  useMultiFileAuthState,
  type WAMessage,
} from "baileys";
import QRCode from "qrcode";
import { config, isDev } from "@/config";
import db, {
  addHit,
  getAfk,
  getGroup,
  getPendingReminders,
  getUser,
  isBanned,
  markReminderDone,
  removeAfk,
  updateMemberChat,
} from "@/database";
import { checkGameAnswer } from "@/game";
import { parseMessage } from "@/helper";
import { commands, loadCommands } from "@/loader";
import { logger } from "@/logger";

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
      const group = getGroup(id);

      for (const p of participants) {
        const jid = p.phoneNumber || p.id;
        if (action === "add") {
          updateMemberChat(id, jid);
        } else {
          db.run("DELETE FROM group_members WHERE groupJid = ? AND memberJid = ?", [id, jid]);
        }
      }

      const mentions = participants.map((p) => p.phoneNumber || p.id);
      const tags = mentions.map((m) => `@${m.replace(/@.+/, "")}`).join(", ");

      // Welcome message
      if (action === "add" && group.welcome) {
        await sock.sendMessage(id, {
          text: `👋 Welcome ${tags}! Semoga betah di group ini.`,
          mentions,
        });
      }

      // Goodbye message
      if (action === "remove" && group.goodbye) {
        await sock.sendMessage(id, {
          text: `👋 Goodbye ${tags}, sampai jumpa lagi.`,
          mentions,
        });
      }
    }
  });

  // Message store for antidelete (TTL: 10 minutes)
  const messageStore = new Map<string, WAMessage>();
  const spamTracker = new Map<string, number[]>();
  const MSG_TTL = 10 * 60 * 1000;

  setInterval(() => {
    const now = Date.now();
    for (const [id, msg] of messageStore) {
      const ts = (msg.messageTimestamp as number) * 1000;
      if (now - ts > MSG_TTL) messageStore.delete(id);
    }
  }, 60_000);

  // Reminder checker
  setInterval(async () => {
    const reminders = getPendingReminders();
    for (const r of reminders) {
      markReminderDone(r.id);
      await sock.sendMessage(r.chatJid, {
        text: `⏰ *Reminder!*\n\n@${r.jid.replace(/@.+/, "")}: ${r.message}`,
        mentions: [r.jid],
      });
    }
  }, 30_000);

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

        // Auto-register all members if group has no data yet
        const count = db
          .query("SELECT COUNT(*) as c FROM group_members WHERE groupJid = ?")
          .get(parse.jid) as { c: number };
        if (count.c <= 1) {
          const metadata = await sock.groupMetadata(parse.jid);
          for (const p of metadata.participants) {
            updateMemberChat(parse.jid, p.phoneNumber || p.id);
          }
        }

        // Antilink: delete messages containing links (except admins)
        const group = getGroup(parse.jid);
        if (group.antilink && !parse.isAdmin && /https?:\/\/\S+/i.test(parse.body)) {
          await sock.sendMessage(parse.jid, { delete: msg.key });
          await sock.sendMessage(parse.jid, {
            text: `⚠️ @${parse.sender.replace(/@.+/, "")} link tidak diperbolehkan!`,
            mentions: [parse.sender],
          });
          continue;
        }

        // Antispam: 5+ messages in 10 seconds = spam
        if (group.antispam && !parse.isAdmin) {
          const key = `${parse.jid}:${parse.sender}`;
          const now = Date.now();
          const timestamps = spamTracker.get(key) || [];
          timestamps.push(now);
          const recent = timestamps.filter((t) => now - t < 10_000);
          spamTracker.set(key, recent);
          if (recent.length >= 5) {
            spamTracker.delete(key);
            await sock.sendMessage(parse.jid, { delete: msg.key });
            await sock.sendMessage(parse.jid, {
              text: `⚠️ @${parse.sender.replace(/@.+/, "")} jangan spam!`,
              mentions: [parse.sender],
            });
            continue;
          }
        }

        // Antitoxic: delete messages containing toxic words
        if (group.antitoxic && !parse.isAdmin) {
          const toxic =
            /anjing|bangsat|kontol|memek|babi|tolol|goblok|bajingan|asu|jancok|ngentot|pepek/i;
          if (toxic.test(parse.body)) {
            await sock.sendMessage(parse.jid, { delete: msg.key });
            await sock.sendMessage(parse.jid, {
              text: `⚠️ @${parse.sender.replace(/@.+/, "")} jaga bicaramu!`,
              mentions: [parse.sender],
            });
            continue;
          }
        }

        // Anti-NSFW: detect NSFW images
        if (group.antinsfw && !parse.isAdmin && msg.message?.imageMessage) {
          try {
            const buffer = await downloadMediaMessage(msg, "buffer", {});
            const base64 = Buffer.from(buffer).toString("base64");
            const res = await fetch("https://api.seaavey.com/tools/nsfw-detect", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-API-KEY": config.apiKey,
              },
              body: JSON.stringify({ image: base64 }),
            });
            const data = (await res.json()) as { data?: { nsfw?: boolean } };
            if (data.data?.nsfw) {
              await sock.sendMessage(parse.jid, { delete: msg.key });
              await sock.sendMessage(parse.jid, {
                text: `🚫 @${parse.sender.replace(/@.+/, "")} gambar NSFW terdeteksi dan dihapus!`,
                mentions: [parse.sender],
              });
              continue;
            }
          } catch {}
        }
      }

      // Game answer check
      if (parse.body && !parse.body.startsWith(config.prefix)) {
        // AFK: check if sender is AFK and remove
        const senderAfk = getAfk(parse.sender);
        if (senderAfk) {
          removeAfk(parse.sender);
          await sock.sendMessage(parse.jid, {
            text: `👋 @${parse.sender.replace(/@.+/, "")} sudah kembali! (AFK ${Math.floor((Date.now() - senderAfk.timestamp) / 60000)} menit)`,
            mentions: [parse.sender],
          });
        }

        // AFK: check if mentioned users are AFK
        for (const m of parse.mentioned) {
          const afk = getAfk(m);
          if (afk) {
            await sock.sendMessage(parse.jid, {
              text: `💤 @${m.replace(/@.+/, "")} sedang AFK\nAlasan: ${afk.reason}\nSejak: ${Math.floor((Date.now() - afk.timestamp) / 60000)} menit lalu`,
              mentions: [m],
            });
          }
        }

        const gameResult = checkGameAnswer(parse.jid, parse.body, parse.sender);
        if (gameResult) {
          await sock.sendMessage(parse.jid, { text: gameResult }, { quoted: msg });
          continue;
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
        const user = getUser(parse.sender);
        if (user) {
          const prevLevel = user.level;
          cmd.handler(sock, parse).catch((e) => logger.error(e));
          const after = getUser(parse.sender);
          if (after && after.level > prevLevel) {
            await sock.sendMessage(parse.jid, {
              text: `🎉 *Level Up!*\n\n@${parse.sender.replace(/@.+/, "")} naik ke level *${after.level}*! 🏆`,
              mentions: [parse.sender],
            });
          }
        } else {
          cmd.handler(sock, parse).catch((e) => logger.error(e));
        }
      }
    }
  });
}

startBot();
