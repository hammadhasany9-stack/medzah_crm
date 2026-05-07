const fs = require("fs");

const accountPath = "e:/Medzah-Nexkara/medzah_crm/app/[tenant]/account/page.tsx";
let account = fs.readFileSync(accountPath, "utf8");
account = account.replace(
  'import { TenantLink } from "@/components/providers/TenantLink";',
  'import { TenantLink, useTenant } from "@/components/providers/TenantProvider";'
);
account = account.replace(
  "export default function AccountPage() {\n  const pathname = usePathname();\n  const [accounts, setAccounts]",
  "export default function AccountPage() {\n  const pathname = usePathname();\n  const { basePath } = useTenant();\n  const accountListPath = `${basePath}/account`;\n  const [accounts, setAccounts]"
);
account = account.replace(
  "  useEffect(() => {\n    if (pathname === \"/account\") setAccounts(loadAccounts());\n  }, [pathname]);",
  "  useEffect(() => {\n    if (pathname === accountListPath) setAccounts(loadAccounts());\n  }, [pathname, accountListPath]);"
);
fs.writeFileSync(accountPath, account);

const contactPath = "e:/Medzah-Nexkara/medzah_crm/app/[tenant]/contact/page.tsx";
let contact = fs.readFileSync(contactPath, "utf8");
contact = contact.replace(
  'import { TenantLink } from "@/components/providers/TenantLink";',
  'import { TenantLink, useTenant } from "@/components/providers/TenantProvider";'
);
contact = contact.replace(
  "export default function ContactPage() {\n  const pathname = usePathname();\n  const [contacts, setContacts]",
  "export default function ContactPage() {\n  const pathname = usePathname();\n  const { basePath } = useTenant();\n  const contactListPath = `${basePath}/contact`;\n  const [contacts, setContacts]"
);
contact = contact.replace(
  "  useEffect(() => {\n    if (pathname !== \"/contact\") return;\n    setContacts(loadContacts());\n    const map: Record<string, string> = {};\n    loadAccounts().forEach((a) => {\n      map[a.name] = a.id;\n    });\n    setAccountIdMap(map);\n  }, [pathname]);",
  "  useEffect(() => {\n    if (pathname !== contactListPath) return;\n    setContacts(loadContacts());\n    const map: Record<string, string> = {};\n    loadAccounts().forEach((a) => {\n      map[a.name] = a.id;\n    });\n    setAccountIdMap(map);\n  }, [pathname, contactListPath]);"
);
fs.writeFileSync(contactPath, contact);

console.log("ok");
