import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const completedTasks = await prisma.task.findMany({
      where: {
        status: "COMPLETED",
        updatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const currencies = ["SAR", "USD", "EGP"];
    const report: Record<string, any> = {};

    currencies.forEach((currency) => {
      const taskRevenue = completedTasks
        .filter((task) => task.currency === currency)
        .reduce((sum, task) => sum + task.totalPrice, 0);

      const taskProfit = completedTasks
        .filter((task) => task.currency === currency)
        .reduce((sum, task) => sum + task.netProfit, 0);

      const totalExpenses = expenses
        .filter((expense) => expense.currency === currency)
        .reduce((sum, expense) => sum + expense.amount, 0);

      const netProfit = taskProfit - totalExpenses;

      report[currency] = {
        totalRevenue: taskRevenue,
        taskProfit: taskProfit,
        totalExpenses: totalExpenses,
        netProfit: netProfit,
        taskCount: completedTasks.filter((task) => task.currency === currency).length,
        expenseCount: expenses.filter((expense) => expense.currency === currency).length,
      };
    });

    return NextResponse.json({
      month,
      year,
      startDate,
      endDate,
      report,
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
