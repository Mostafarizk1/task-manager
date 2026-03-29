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

    if (session.user.role !== "ADMIN" && session.user.id !== params.id) {
      return NextResponse.json(
        { error: "Only admins can update other users' phone numbers" },
        { status: 403 }
      );
    }

    const { phoneNumber } = await request.json();

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { phoneNumber },
    });

    return NextResponse.json({ success: true, phoneNumber: user.phoneNumber });
  } catch (error) {
    console.error("Error updating phone number:", error);
    return NextResponse.json(
      { error: "Failed to update phone number" },
      { status: 500 }
    );
  }
}
