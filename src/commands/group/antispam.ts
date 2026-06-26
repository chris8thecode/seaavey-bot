import { toggleCommand } from "@/utils/group-toggle";
import { t } from "@/core/translations";

export default toggleCommand({
  name: "Anti Spam",
  alias: ["spam", "antispam"],
  field: "antispam",
  description: t("group.antispam.desc"),
});
