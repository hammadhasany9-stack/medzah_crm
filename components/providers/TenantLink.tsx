"use client";

import Link from "next/link";
import { useTenant, useTenantPath } from "./TenantProvider";

type Props = React.ComponentProps<typeof Link>;

export function TenantLink({ href, ...rest }: Props) {
  const t = useTenantPath();
  const { basePath } = useTenant();
  const resolved = (() => {
    if (typeof href !== "string") return href;
    if (href.startsWith("//")) return href;
    if (href.startsWith(basePath + "/") || href === basePath) return href;
    if (href.startsWith("/")) return t(href);
    return href;
  })();
  return <Link href={resolved} {...rest} />;
}
