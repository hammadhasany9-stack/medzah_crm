import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { TenantProvider } from "@/components/providers/TenantProvider";
import { CrmOnboardingClient } from "./CrmOnboardingClient";

export default async function CrmOnboardingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const { id } = await params;
  return (
    <TenantProvider tenant={session.tenant}>
      <CrmOnboardingClient id={id} />
    </TenantProvider>
  );
}
