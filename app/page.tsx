import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.tenant === "amanda") {
    redirect("/amanda/dashboard");
  }
  redirect("/kevin/dashboard");
}
