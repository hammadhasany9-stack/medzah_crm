const fs = require("fs");
const path = require("path");

const ap = path.join(process.cwd(), "app", "[tenant]", "account", "page.tsx");
let at = fs.readFileSync(ap, "utf8");
at = at.replace(
  "export default function AccountPage() {\n  const pathname = usePathname();\n  const [accounts, setAccounts]",
  "export default function AccountPage() {\n  const pathname = usePathname();\n  const { basePath } = useTenant();\n  const accountListPath = `${basePath}/account`;\n  const [accounts, setAccounts]"
);
at = at.replace(
  "    if (pathname === \"/account\") setAccounts(loadAccounts());\n  }, [pathname]);",
  "    if (pathname === accountListPath) setAccounts(loadAccounts());\n  }, [pathname, accountListPath]);"
);
fs.writeFileSync(ap, at);

const cp = path.join(process.cwd(), "app", "[tenant]", "contact", "page.tsx");
let ct = fs.readFileSync(cp, "utf8");
ct = ct.replace(
  "export default function ContactPage() {\n  const pathname = usePathname();\n  const [contacts, setContacts]",
  "export default function ContactPage() {\n  const pathname = usePathname();\n  const { basePath } = useTenant();\n  const contactListPath = `${basePath}/contact`;\n  const [contacts, setContacts]"
);
ct = ct.replace(
  "    if (pathname !== \"/contact\") return;\n    setContacts(loadContacts());\n    const map: Record<string, string> = {};\n    loadAccounts().forEach((a) => {\n      map[a.name] = a.id;\n    });\n    setAccountIdMap(map);\n  }, [pathname]);",
  "    if (pathname !== contactListPath) return;\n    setContacts(loadContacts());\n    const map: Record<string, string> = {};\n    loadAccounts().forEach((a) => {\n      map[a.name] = a.id;\n    });\n    setAccountIdMap(map);\n  }, [pathname, contactListPath]);"
);
fs.writeFileSync(cp, ct);

console.log("done");
