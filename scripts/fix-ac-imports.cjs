const fs = require("fs");
for (const p of [
  "e:/Medzah-Nexkara/medzah_crm/app/[tenant]/account/page.tsx",
  "e:/Medzah-Nexkara/medzah_crm/app/[tenant]/contact/page.tsx",
]) {
  let t = fs.readFileSync(p, "utf8");
  t = t.replace(
    'import { TenantLink, useTenant } from "@/components/providers/TenantProvider";',
    'import { useTenant } from "@/components/providers/TenantProvider";\nimport { TenantLink } from "@/components/providers/TenantLink";'
  );
  fs.writeFileSync(p, t);
}
console.log("fixed imports");
