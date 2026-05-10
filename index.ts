import { existsSync } from "node:fs";
import { createInterface } from "node:readline";
import type { Boom } from "@hapi/boom";
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "baileys";
import QRCode from "qrcode";
import { config } from "@/config";
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
      rl.question("Masukkan nomor WhatsApp (contoh: 6289513081052): ", r),
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

  sock.ev.on("messages.upsert", ({ messages }) => {
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      const parse = parseMessage(sock, msg);
      if (!parse.body.startsWith(config.prefix)) continue;

      const [cmdName] = parse.body.slice(config.prefix.length).split(" ");
      if (!cmdName) continue;
      const cmd = commands.get(cmdName);
      if (cmd) cmd.handler(sock, parse).catch((e) => logger.error(e));
    }
  });
}

startBot();
