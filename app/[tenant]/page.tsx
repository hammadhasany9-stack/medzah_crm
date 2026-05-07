import { redirect } from "next/navigation";
import type { Tenant } from "@/lib/auth/constants";
import { isTenant } from "@/lib/auth/constants";

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: raw } = await params;
  if (!isTenant(raw)) {
    redirect("/login");
  }
  const tenant = raw as Tenant;
  if (tenant === "amanda") {
    redirect("/amanda/dashboard");
  }
  redirect("/kevin/dashboard");
}
