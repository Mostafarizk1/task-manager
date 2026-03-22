import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { signOut } from "next-auth/react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            مرحباً {session.user.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            الدور: <span className="font-semibold">{session.user.role}</span>
          </p>
          <p className="text-green-600 dark:text-green-400 font-semibold text-xl">
            ✅ تسجيل الدخول نجح!
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            المشروع جاهز للتطوير الآن
          </p>
        </div>
      </div>
    </div>
  );
}
