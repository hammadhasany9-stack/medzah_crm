const fs = require("fs");
const paths = [
  "app/[tenant]/quotes/[id]/page.tsx",
  "app/[tenant]/contracts/[id]/page.tsx",
  "app/[tenant]/contracts/[id]/edit/page.tsx",
  "app/[tenant]/leads/[id]/page.tsx",
  "app/[tenant]/leads/[id]/edit/page.tsx",
  "app/[tenant]/opportunity/[id]/page.tsx",
  "app/[tenant]/opportunity/[id]/edit/page.tsx",
];
const root = "e:/Medzah-Nexkara/medzah_crm";
for (const rel of paths) {
  const f = `${root}/${rel}`;
  let t = fs.readFileSync(f, "utf8");
  if (!t.includes('import { useParams }')) {
    if (t.includes('import { useTenantRouter }')) {
      t = t.replace(
        'import { useTenantRouter }',
        'import { useParams } from "next/navigation";\nimport { useTenantRouter }'
      );
    } else {
      t = t.replace(
        '"use client";\n\n',
        '"use client";\n\nimport { useParams } from "next/navigation";\n\n'
      );
    }
  }
  t = t.replace(
    /export default function (\w+)\(\{ params \}: \{ params: \{ id: string \} \}\) \{\r?\n  const \{ id \} = params;/g,
    "export default function $1() {\n  const params = useParams();\n  const id = params.id as string;"
  );
  fs.writeFileSync(f, t, "utf8");
  console.log("fixed", rel);
}
