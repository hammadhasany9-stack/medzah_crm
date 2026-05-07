const fs = require("fs");
const path = require("path");
const root = "e:/Medzah-Nexkara/medzah_crm";
const files = {
  "lib/auth/constants.ts": "export type Tenant = \"kevin\" | \"amanda\";\n",
};
for (const [rel, body] of Object.entries(files)) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body, "utf8");
}
console.log("done");
