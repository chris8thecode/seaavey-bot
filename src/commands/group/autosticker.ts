import { toggleCommand } from "@/utils/group-toggle";
import { t } from "@/core/translations";

export default toggleCommand({
  name: "Auto Sticker",
  field: "autosticker",
  alias: ["as", "autos", "autosticker"],
  description: t("group.autosticker.desc"),
});
