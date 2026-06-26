import { toggleCommand } from "@/utils/group-toggle";
import { t } from "@/core/translations";

export default toggleCommand({
  name: "Goodbye",
  alias: ["bye", "goodbye"],
  field: "goodbye",
  description: t("group.goodbye.desc"),
});
