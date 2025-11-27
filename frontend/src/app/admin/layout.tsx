import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/api/_utils/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  
  if (!session) {
    redirect("/login?redirect=/admin");
  }
  
  if (session.role !== "admin") {
    redirect("/");
  }

  return <AdminShell user={session}>{children}</AdminShell>;
}

