import { t } from "@/core/translations";
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
  description: t("tools.resi.desc"),
  handler: async (_sock, msg) => {
    const courier = msg.args[0]?.toLowerCase();
    const awb = msg.args[1];
    if (!courier || !awb) {
      const list = Object.keys(couriers).join(", ");
      return msg.reply(t("tools.resi.format", { list }));
    }
    if (!couriers[courier]) return msg.reply(t("tools.resi.invalidCourier"));
    const data = await safeFetchJSON<{
      status?: number;
      data?: { summary?: { status: string; desc: string; courier: string; date: string } };
    }>(`https://api.binderbyte.com/v1/track?api_key=free&courier=${couriers[courier]}&awb=${awb}`);
    if (!data || data.status !== 200 || !data.data?.summary)
      return msg.reply(t("tools.resi.notFound"));
    const s = data.data.summary;
    await msg.reply(
      t("tools.resi.tracking", {
        courier: courier.toUpperCase(),
        awb,
        status: s.status,
        desc: s.desc,
        date: s.date,
      }),
    );
  },
});
