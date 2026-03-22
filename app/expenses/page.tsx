import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ExpensesClient from "@/components/ExpensesClient";
import { prisma } from "@/lib/prisma";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      date: "desc",
    },
  });

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
    },
  });

  return <ExpensesClient initialExpenses={expenses} tasks={tasks} user={session.user} />;
}
