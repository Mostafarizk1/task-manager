import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause = session.user.role === "ADMIN" 
      ? {} 
      : { userId: session.user.id };

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: {
        deadline: "asc",
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      clientName,
      deadline,
      totalPrice,
      currency,
      collaboratorName,
      collaboratorCut,
      status,
    } = body;

    const collaboratorCutValue = collaboratorCut || 0;
    const netProfit = totalPrice - collaboratorCutValue;

    const task = await prisma.task.create({
      data: {
        title,
        clientName,
        deadline: new Date(deadline),
        totalPrice,
        currency: currency || "USD",
        collaboratorName,
        collaboratorCut: collaboratorCutValue,
        netProfit,
        status: status || "ACTIVE",
        userId: session.user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
