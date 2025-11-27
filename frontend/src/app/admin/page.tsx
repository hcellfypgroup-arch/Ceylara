import { db } from "@/lib/db";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminHomePage() {
  await db.connect();
  return <AdminDashboard />;
}
