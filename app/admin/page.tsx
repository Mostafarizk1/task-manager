import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminDashboard from "@/components/AdminDashboard";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role !== "admin") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    where: {
      role: "user",
    },
    include: {
      tasks: true,
      expenses: true,
    },
  });

  return <AdminDashboard users={users} admin={session.user} />;
}
