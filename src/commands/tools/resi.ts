import { defineCommand } from "@/core/types";
import { safeFetchJSON } from "@/utils/helper";

const couriers: Record<string, string> = {
  jne: "jne",
  jnt: "jnt",
  sicepat: "sicepat",
  pos: "pos",
  anteraja: "anteraja",
  ninja: "ninja",
  lion: "lion",
  tiki: "tiki",
  wahana: "wahana",
};

export default defineCommand({
  name: "Resi",
  alias: ["resi"],
  description: "Cek resi paket. Contoh: .resi jne JT1234567890",
  handler: async (_sock, msg) => {
    const courier = msg.args[0]?.toLowerCase();
    const awb = msg.args[1];
    if (!courier || !awb) {
      const list = Object.keys(couriers).join(", ");
      return msg.reply(
        `Format: .resi <kurir> <no_resi>\nContoh: .resi jne JT1234567890\n\nKurir: ${list}`,
      );
    }
    if (!couriers[courier]) return msg.reply("❌ Kurir tidak dikenali.");
    const data = await safeFetchJSON<{
      status?: number;
      data?: { summary?: { status: string; desc: string; courier: string; date: string } };
    }>(
      `https://api.binderbyte.com/v1/track?api_key=free&courier=${couriers[courier]}&awb=${awb}`,
    );
    if (!data || data.status !== 200 || !data.data?.summary) return msg.reply("❌ Resi tidak ditemukan.");
    const s = data.data.summary;
    await msg.reply(
      `📦 *Tracking ${courier.toUpperCase()}*\n\n📋 Resi: ${awb}\n📊 Status: ${s.status}\n📝 ${s.desc}\n📅 ${s.date}`,
    );
  },
});
