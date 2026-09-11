export const dynamic = "force-dynamic";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  const session = getAdminSession();
  if (session) redirect("/admin/menejer/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold">Quizzes Week</div>
          <div className="text-xs text-neutral-500 mt-1">PDP University — Admin panel</div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
