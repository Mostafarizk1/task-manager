import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword1 = await bcrypt.hash("password123", 10);
  const hashedPassword2 = await bcrypt.hash("password456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "المدير",
      password: hashedPassword1,
      role: "admin",
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "user1@example.com" },
    update: {},
    create: {
      email: "user1@example.com",
      name: "المستخدم الأول",
      password: hashedPassword1,
      role: "user",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {},
    create: {
      email: "user2@example.com",
      name: "المستخدم الثاني",
      password: hashedPassword2,
      role: "user",
    },
  });

  console.log("✅ تم إنشاء المستخدمين:");
  console.log("� المدير: admin@example.com | كلمة المرور: password123");
  console.log("�📧 المستخدم 1: user1@example.com | كلمة المرور: password123");
  console.log("📧 المستخدم 2: user2@example.com | كلمة المرور: password456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
