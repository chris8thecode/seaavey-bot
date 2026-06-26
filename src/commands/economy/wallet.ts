import { defineCommand } from "@/core/types";
import { getEconomy } from "@/infra/database";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Wallet",
  alias: ["bal", "saldo", "wallet"],
  description: t("economy.wallet.desc"),
  handler: async (_sock, msg) => {
    const eco = getEconomy(msg.sender);
    await msg.reply(
      `💰 *Wallet*\n\n🪙 Cash: ${eco.wallet.toLocaleString()}\n🏦 Bank: ${eco.bank.toLocaleString()}\n📊 Total: ${(eco.wallet + eco.bank).toLocaleString()}`,
    );
  },
});
