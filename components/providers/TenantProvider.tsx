"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Tenant } from "@/lib/auth/constants";

const TenantContext = React.createContext<{
  tenant: Tenant;
  basePath: string;
} | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant;
  children: React.ReactNode;
}) {
  const basePath = `/${tenant}`;
  return (
    <TenantContext.Provider value={{ tenant, basePath }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = React.useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return ctx;
}

/** CRM paths start with "/", e.g. `/leads`. */
export function useTenantPath() {
  const { basePath } = useTenant();
  return React.useCallback(
    (path: string) => {
      const p = path.startsWith("/") ? path : `/${path}`;
      return `${basePath}${p}`;
    },
    [basePath]
  );
}

export function useTenantRouter() {
  const router = useRouter();
  const to = useTenantPath();
  return React.useMemo(
    () => ({
      ...router,
      push: (href: string) => router.push(to(href)),
      replace: (href: string) => router.replace(to(href)),
      prefetch: (href: string) => router.prefetch(to(href)),
    }),
    [router, to]
  );
}
