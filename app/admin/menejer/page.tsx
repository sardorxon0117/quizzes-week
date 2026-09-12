export const dynamic = "force-dynamic";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  const session = getAdminSession();
  if (session) redirect("/admin/menejer/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(0,175,166)] shadow-lg shadow-teal-900/30">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
              <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="m7 12 3 3 7-7" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-2xl font-black text-neutral-900">Quizzes Week</div>
          <div className="text-xs font-semibold text-neutral-500 mt-1">PDP University — Admin panel</div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
