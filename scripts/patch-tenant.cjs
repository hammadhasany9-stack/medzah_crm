const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.isFile() && (e.name.endsWith(".tsx") || e.name.endsWith(".ts")))
      acc.push(p);
  }
  return acc;
}

const skipFiles = new Set([
  "TenantProvider.tsx",
  "TenantLink.tsx",
]);

function patchFile(file) {
  const base = path.basename(file);
  if (skipFiles.has(base)) return false;
  let t = fs.readFileSync(file, "utf8");
  if (!t.includes('"use client"')) return false;
  let changed = false;

  if (/\buseRouter\s*\(/.test(t)) {
    const lines = t.split(/\r?\n/);
    const out = [];
    let addedTenantRouter = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = line.match(
        /^import\s+\{([^}]+)\}\s+from\s+["']next\/navigation["'];?$/
      );
      if (m && m[1].includes("useRouter")) {
        const parts = m[1]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .filter((s) => !/^useRouter$/.test(s.split(/\s+/)[0]));
        if (parts.length) {
          out.push(`import { ${parts.join(", ")} } from "next/navigation";`);
        }
        if (!addedTenantRouter) {
          out.push(
            `import { useTenantRouter } from "@/components/providers/TenantProvider";`
          );
          addedTenantRouter = true;
        }
        changed = true;
        continue;
      }
      out.push(line);
    }
    t = out.join("\n");
    t = t.replace(/\buseRouter\s*\(\s*\)/g, "useTenantRouter()");
    changed = true;
  }

  if (
    t.includes('from "next/link"') &&
    (t.includes('href="/') ||
      t.includes("href={`/") ||
      t.includes("href={`mailto") === false)
  ) {
    const needsTenantLink =
      /href=["'`]\//.test(t) ||
      /href=\{\s*`?\//.test(t);
    if (needsTenantLink) {
      if (
        !t.includes("TenantLink") &&
        !t.includes("providers/TenantLink")
      ) {
        t = t.replace(
          'import Link from "next/link";',
          'import { TenantLink } from "@/components/providers/TenantLink";'
        );
        t = t.replace(/<Link\b/g, "<TenantLink");
        t = t.replace(/<\/Link>/g, "</TenantLink>");
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, t, "utf8");
    return true;
  }
  return false;
}

let n = 0;
for (const dir of [
  path.join(root, "app", "[tenant]"),
  path.join(root, "components"),
]) {
  for (const f of walk(dir)) {
    if (patchFile(f)) {
      n++;
      console.log("patched", path.relative(root, f));
    }
  }
}
console.log("total", n);
