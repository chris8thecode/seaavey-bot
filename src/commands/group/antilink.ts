import { toggleCommand } from "@/utils/group-toggle";
import { t } from "@/core/translations";

export default toggleCommand({
  name: "Anti Link",
  alias: ["alink", "antilink"],
  field: "antilink",
  description: t("group.antilink.desc"),
});
