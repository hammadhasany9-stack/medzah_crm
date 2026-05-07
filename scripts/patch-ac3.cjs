const fs = require("fs");
const path = require("path");

const ap = path.join(process.cwd(), "app", "[tenant]", "account", "page.tsx");
let at = fs.readFileSync(ap, "utf8");
at = at.replace(
  "export default function AccountPage() {\r\n  const pathname = usePathname();\r\n  const [accounts, setAccounts]",
  "export default function AccountPage() {\r\n  const pathname = usePathname();\r\n  const { basePath } = useTenant();\r\n  const accountListPath = `${basePath}/account`;\r\n  const [accounts, setAccounts]"
);
at = at.replace(
  "    if (pathname === \"/account\") setAccounts(loadAccounts());\r\n  }, [pathname]);",
  "    if (pathname === accountListPath) setAccounts(loadAccounts());\r\n  }, [pathname, accountListPath]);"
);
if (at.includes('pathname === "/account"')) throw new Error("account replace failed");
fs.writeFileSync(ap, at);

const cp = path.join(process.cwd(), "app", "[tenant]", "contact", "page.tsx");
let ct = fs.readFileSync(cp, "utf8");
ct = ct.replace(
  "export default function ContactPage() {\r\n  const pathname = usePathname();\r\n  const [contacts, setContacts]",
  "export default function ContactPage() {\r\n  const pathname = usePathname();\r\n  const { basePath } = useTenant();\r\n  const contactListPath = `${basePath}/contact`;\r\n  const [contacts, setContacts]"
);
ct = ct.replace(
  "    if (pathname !== \"/contact\") return;\r\n    setContacts(loadContacts());\r\n    const map: Record<string, string> = {};\r\n    loadAccounts().forEach((a) => {\r\n      map[a.name] = a.id;\r\n    });\r\n    setAccountIdMap(map);\r\n  }, [pathname]);",
  "    if (pathname !== contactListPath) return;\r\n    setContacts(loadContacts());\r\n    const map: Record<string, string> = {};\r\n    loadAccounts().forEach((a) => {\r\n      map[a.name] = a.id;\r\n    });\r\n    setAccountIdMap(map);\r\n  }, [pathname, contactListPath]);"
);
if (ct.includes('pathname !== "/contact"')) throw new Error("contact replace failed");
fs.writeFileSync(cp, ct);

console.log("patched");
