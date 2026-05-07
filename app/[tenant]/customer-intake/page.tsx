import { notFound, redirect } from "next/navigation";
import { isTenant } from "@/lib/auth/constants";
import CustomerIntakeListPageClient from "./CustomerIntakeListPageClient";

export default async function CustomerIntakePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  if (!isTenant(tenant)) notFound();
  if (tenant === "amanda") redirect(`/${tenant}/customer-intake/approval`);
  return <CustomerIntakeListPageClient />;
}
