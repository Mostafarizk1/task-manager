import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    // Find tasks with deadline today or tomorrow and status not COMPLETED
    const tasks = await prisma.task.findMany({
      where: {
        deadline: {
          lte: tomorrow,
        },
        status: {
          not: "COMPLETED",
        },
      },
      include: {
        user: true,
      },
    });

    // Send notifications for each task
    const notifications = await Promise.all(
      tasks.map(async (task) => {
        const webhookUrl = process.env.MAKE_WEBHOOK_URL;
        
        if (!webhookUrl || webhookUrl.includes("your-webhook-url-here")) {
          return { task: task.title, status: "skipped - no webhook configured" };
        }

        const payload = {
          taskTitle: task.title,
          clientName: task.clientName,
          deadline: task.deadline.toISOString(),
          collaboratorName: task.collaboratorName,
          status: task.status,
        };

        try {
          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          return {
            task: task.title,
            status: response.ok ? "sent" : "failed",
            statusCode: response.status,
          };
        } catch (error) {
          return {
            task: task.title,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      tasksFound: tasks.length,
      notifications,
    });
  } catch (error) {
    console.error("Notification cron error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
