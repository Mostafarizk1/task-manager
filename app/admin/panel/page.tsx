import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminPanelClient from "@/components/AdminPanelClient";

export default async function AdminPanelPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    where: {
      role: "USER",
    },
    include: {
      tasks: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const usersWithStats = users.map((user) => {
    const totalRevenue = user.tasks.reduce((sum, task) => sum + task.netProfit, 0);
    const completedTasks = user.tasks.filter((t) => t.status === "DONE").length;
    
    return {
      id: user.id,
      username: user.username,
      totalTasks: user.tasks.length,
      completedTasks,
      totalRevenue,
      tasks: user.tasks.map((task) => ({
        ...task,
        deadline: task.deadline.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
    };
  });

  return <AdminPanelClient users={usersWithStats} />;
}
