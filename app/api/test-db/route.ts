import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      usersCount: users.length,
      users: users,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: error.message,
      code: error.code,
    }, { status: 500 });
  }
}
