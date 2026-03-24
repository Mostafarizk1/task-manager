import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage, formatTaskNotification } from "@/lib/telegram";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const upcomingTasks = await prisma.task.findMany({
      where: {
        status: {
          in: ["ACTIVE", "REVIEW"],
        },
        deadline: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
      orderBy: {
        deadline: "asc",
      },
    });

    const overdueTasks = await prisma.task.findMany({
      where: {
        status: {
          in: ["ACTIVE", "REVIEW"],
        },
        deadline: {
          lt: now,
        },
      },
      orderBy: {
        deadline: "asc",
      },
    });

    const activeTasks = await prisma.task.count({
      where: {
        status: {
          in: ["ACTIVE", "REVIEW"],
        },
      },
    });

    const message = formatTaskNotification(upcomingTasks, overdueTasks, activeTasks);
    
    const sent = await sendTelegramMessage(message);

    return NextResponse.json({
      success: sent,
      upcomingCount: upcomingTasks.length,
      overdueCount: overdueTasks.length,
      activeCount: activeTasks,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
