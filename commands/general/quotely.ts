import { api } from "@/api";
import { defineCommand } from "@/types";

export default defineCommand({
  name: "quotely",
  description: "Buat quote gambar dari teks. Contoh: .quotely Hidup itu indah",
  handler: async (_sock, msg) => {
    const text = msg.args.join(" ");
    if (!text) return msg.reply("Format: .quotely <teks>\nContoh: .quotely Hidup itu indah");
    await msg.reply("⏳ Membuat quote...");
    const res = await api.post<{ url: string }>("/tools/quotely", {
      text,
      author: msg.sender.replace(/@.+/, ""),
    });
    await msg.send({ image: { url: res.data.url }, caption: `"${text}"` });
  },
});
