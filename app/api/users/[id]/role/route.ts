import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "غير مصرح لك بهذا الإجراء" },
        { status: 403 }
      );
    }

    const { role } = await request.json();

    if (!role || (role !== "ADMIN" && role !== "USER")) {
      return NextResponse.json(
        { error: "الدور غير صالح" },
        { status: 400 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الدور" },
      { status: 500 }
    );
  }
}
