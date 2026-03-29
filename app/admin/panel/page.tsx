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
      id: {
        not: session.user.id,
      },
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
    const completedTasks = user.tasks.filter((t) => t.status === "COMPLETED").length;
    
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      phoneNumber: user.phoneNumber,
      totalTasks: user.tasks.length,
      completedTasks,
      totalRevenue,
      tasks: user.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        clientName: task.clientName,
        deadline: task.deadline.toISOString(),
        totalPrice: task.totalPrice,
        currency: task.currency,
        collaboratorName: task.collaboratorName,
        collaboratorCut: task.collaboratorCut,
        netProfit: task.netProfit,
        status: task.status,
        userId: task.userId,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
    };
  });

  return <AdminPanelClient users={usersWithStats} />;
}
