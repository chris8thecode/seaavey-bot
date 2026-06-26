import { t } from "@/core/translations";
import { defineCommand } from "@/core/types";
import { getNumber, getRandomItem, getRandomNumber } from "@/utils/helper";

const categories = [
  "fun.rate.category1",
  "fun.rate.category2",
  "fun.rate.category3",
  "fun.rate.category4",
  "fun.rate.category5",
  "fun.rate.category6",
  "fun.rate.category7",
  "fun.rate.category8",
];

export default defineCommand({
  name: "Rate",
  alias: ["rate"],
  description: t("fun.rate.description"),
  handler: async (_sock, msg) => {
    const target = msg.mentioned[0] || msg.quoted?.sender || msg.sender;
    const cat = t(getRandomItem(categories));
    const score = getRandomNumber(0, 100);
    await msg.send({
      text: t("fun.rate.result", { target: getNumber(target), category: cat, score }),
      mentions: [target],
    });
  },
});
