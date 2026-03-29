import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
      advancePayment,
      advancePaymentCurrency,
      isFullyDelivered,
      isFullyPaid,
      clientPaidAmount,
      clientRemainingAmount,
      collaboratorPaid,
      collaboratorPaidAmount,
      collaboratorPaidCurrency,
    } = body;

    const collaboratorCutValue = collaboratorCut || 0;
    const netProfit = totalPrice - collaboratorCutValue;

    const whereClause = session.user.role === "ADMIN"
      ? { id: params.id }
      : { id: params.id, userId: session.user.id };

    const task = await prisma.task.update({
      where: whereClause,
      data: {
        title,
        clientName,
        deadline: new Date(deadline),
        totalPrice,
        currency: currency || "USD",
        collaboratorName,
        collaboratorCut: collaboratorCutValue,
        netProfit,
        status,
        advancePayment: advancePayment ?? 0,
        advancePaymentCurrency: advancePaymentCurrency || "USD",
        isFullyDelivered: isFullyDelivered ?? false,
        isFullyPaid: isFullyPaid ?? false,
        clientPaidAmount: clientPaidAmount ?? 0,
        clientRemainingAmount: clientRemainingAmount ?? 0,
        collaboratorPaid: collaboratorPaid ?? false,
        collaboratorPaidAmount: collaboratorPaidAmount ?? 0,
        collaboratorPaidCurrency: collaboratorPaidCurrency || "USD",
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause = session.user.role === "ADMIN"
      ? { id: params.id }
      : { id: params.id, userId: session.user.id };

    await prisma.task.delete({
      where: whereClause,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
