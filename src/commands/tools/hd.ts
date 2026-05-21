import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import axios from "axios";
import { downloadMediaMessage, type WAMessage, type WASocket } from "baileys";
import FormData from "form-data";
import { defineCommand } from "@/core/types";

const SIGN_API = "https://cloudinary-tools.netlify.app/.netlify/functions/sign-upload-params";
const UPLOAD_API = "https://api.cloudinary.com/v1_1/dtz0urit6/auto/upload";

const API_KEY = "985946268373735";
const UPLOAD_PRESET = "cloudinary-tools";
const SOURCE = "ml";

const USER_AGENT =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

function createTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function createUploadId() {
  return crypto.randomUUID();
}

async function getSignature(timestamp: number) {
  const payload = {
    paramsToSign: {
      timestamp,
      upload_preset: UPLOAD_PRESET,
      source: SOURCE,
    },
  };

  const { data, status } = await axios.post(SIGN_API, payload, {
    headers: {
      "user-agent": USER_AGENT,
      "content-type": "application/json",
      accept: "*/*",
      origin: "https://cloudinary.com",
      referer: "https://cloudinary.com/",
    },
    timeout: 30000,
    validateStatus: () => true,
  });

  if (status < 200 || status >= 300 || !data?.signature) {
    throw new Error(`Gagal ambil signature: HTTP ${status}`);
  }

  return data.signature;
}

async function upscaleCloudinary(filePath: string): Promise<string> {
  const timestamp = createTimestamp();
  const signature = await getSignature(timestamp);

  const form = new FormData();
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("source", SOURCE);
  form.append("signature", signature);
  form.append("timestamp", String(timestamp));
  form.append("api_key", API_KEY);

  // Create readable stream for FormData
  const { createReadStream } = await import("node:fs");
  form.append("file", createReadStream(filePath));

  const { data, status } = await axios.post(UPLOAD_API, form, {
    headers: {
      ...form.getHeaders(),
      "user-agent": USER_AGENT,
      accept: "application/json, text/javascript, */*; q=0.01",
      origin: "https://upload-widget.cloudinary.com",
      referer: "https://upload-widget.cloudinary.com/",
      "x-requested-with": "XMLHttpRequest",
      "x-unique-upload-id": createUploadId(),
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 120000,
    validateStatus: () => true,
  });

  if (status < 200 || status >= 300 || !data?.secure_url) {
    throw new Error(`Upload gagal: HTTP ${status}`);
  }

  return data.secure_url;
}

export default defineCommand({
  name: "HD",
  alias: ["hd", "remini", "hdr"],
  description: "Upscale gambar ke HD menggunakan Cloudinary",
  handler: async (sock: WASocket, msg) => {
    try {
      const mediaMsg = quoted
        ? {
            message: quoted,
            key: msg.msg.message?.extendedTextMessage?.contextInfo?.stanzaId,
          }
        : msg.msg;
      const buffer = await downloadMediaMessage(mediaMsg as WAMessage, "buffer", {});

      const tempPath = path.join(process.cwd(), `tmp_${Date.now()}.jpg`);
      await fs.writeFile(tempPath, buffer);

      const resultUrl = await upscaleCloudinary(tempPath);

      await sock.sendMessage(
        msg.jid,
        {
          image: { url: resultUrl },
          caption: "✅ Berhasil meningkatkan kualitas gambar ke HD!",
        },
        { quoted: msg.msg },
      );

      await fs.unlink(tempPath);
    } catch (e: unknown) {
      const error = e as Error;
      await msg.reply(`❌ Gagal memproses gambar: ${error.message}`);
    }
  },
});
