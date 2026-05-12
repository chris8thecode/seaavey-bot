import { downloadMediaMessage } from "baileys";
import { api } from "@/api";
import { defineCommand } from "@/types";

export default defineCommand({
  name: "removebg",
  description: "Hapus background gambar. Reply/kirim gambar.",
  handler: async (_sock, msg) => {
    const quotedMsg = msg.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg = msg.msg.message?.imageMessage || quotedMsg?.imageMessage;
    if (!imgMsg) return msg.reply("❌ Reply atau kirim gambar yang ingin dihapus background-nya.");
    await msg.reply("⏳ Menghapus background...");
    const buffer = await downloadMediaMessage(
      { message: { imageMessage: imgMsg }, key: msg.msg.key } as Parameters<
        typeof downloadMediaMessage
      >[0],
      "buffer",
      {},
    );
    const base64 = Buffer.from(buffer).toString("base64");
    const res = await api.post<{ url: string }>("/tools/removebg", { image: base64 });
    await msg.send({ image: { url: res.data.url }, caption: "✅ Background removed!" });
  },
});
