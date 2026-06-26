import { defineCommand } from "@/core/types";
import { addWallet, getEconomy, setLastDaily } from "@/infra/database";
import { getRandomNumber } from "@/utils/helper";
import { t } from "@/core/translations";

export default defineCommand({
  name: "Daily",
  alias: ["daily"],
  description: t("economy.daily.desc"),
  handler: async (_sock, msg) => {
    const eco = getEconomy(msg.sender);
    const now = Date.now();
    const oneDay = 86400000;
    if (now - eco.lastDaily < oneDay) {
      const remaining = oneDay - (now - eco.lastDaily);
      const hours = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      return msg.reply(`⏰ You already claimed today. Try again in ${hours}h ${mins}m.`);
    }
    const reward = getRandomNumber(3000, 7999);
    addWallet(msg.sender, reward);
    setLastDaily(msg.sender);
    await msg.reply(
      `🎁 Daily reward: +${reward.toLocaleString()} coins!\n💰 Wallet: ${(eco.wallet + reward).toLocaleString()}`,
    );
  },
});
