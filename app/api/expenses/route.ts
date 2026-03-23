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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const expenses = await prisma.expense.findMany({
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { type, amount, currency, description, date } = body;

    const expense = await prisma.expense.create({
      data: {
        type,
        amount,
        currency: currency || "USD",
        description,
        date: date ? new Date(date) : new Date(),
        userId: session.user.id,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
