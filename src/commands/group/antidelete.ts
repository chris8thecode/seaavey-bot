import { toggleCommand } from "@/utils/group-toggle";
import { t } from "@/core/translations";

export default toggleCommand({
  name: "Anti Delete",
  alias: ["adel", "antidelete"],
  field: "antidelete",
  description: t("group.antidelete.desc"),
});
