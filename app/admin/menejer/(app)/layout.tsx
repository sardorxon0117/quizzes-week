import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const session = getAdminSession();
  if (!session) redirect("/admin/menejer");

  return (
    <div className="min-h-screen flex">
      <AdminSidebar username={session.username} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
