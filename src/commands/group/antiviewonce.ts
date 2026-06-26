import { t } from "@/core/translations";
import { toggleCommand } from "@/utils/group-toggle";

export default toggleCommand({
  name: "Anti View Once",
  field: "antiviewonce",
  alias: ["avo", "antiviewonce"],
  description: t("group.antiviewonce.description"),
});
