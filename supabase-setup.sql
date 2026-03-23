-- ============================================
-- نظام إدارة المهام - Supabase Setup Script
-- تحديث: مارس 2026
-- ============================================

-- إنشاء Enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
CREATE TYPE "Currency" AS ENUM ('SAR', 'USD', 'EGP');
CREATE TYPE "TaskStatus" AS ENUM ('ACTIVE', 'REVIEW', 'COMPLETED');

-- إنشاء جدول المستخدمين (Users)
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role "Role" DEFAULT 'USER' NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- إنشاء جدول المهام (Tasks)
CREATE TABLE IF NOT EXISTS "Task" (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    deadline TIMESTAMP(3) NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    currency "Currency" DEFAULT 'USD' NOT NULL,
    "collaboratorName" TEXT,
    "collaboratorCut" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "netProfit" DOUBLE PRECISION NOT NULL,
    status "TaskStatus" DEFAULT 'ACTIVE' NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- إنشاء جدول المصاريف النثرية (Expenses)
CREATE TABLE IF NOT EXISTS "Expense" (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    currency "Currency" DEFAULT 'USD' NOT NULL,
    description TEXT,
    date TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- إنشاء الـ Indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"(username);
CREATE INDEX IF NOT EXISTS "Task_userId_idx" ON "Task"("userId");
CREATE INDEX IF NOT EXISTS "Task_deadline_idx" ON "Task"(deadline);
CREATE INDEX IF NOT EXISTS "Task_status_idx" ON "Task"(status);
CREATE INDEX IF NOT EXISTS "Task_currency_idx" ON "Task"(currency);
CREATE INDEX IF NOT EXISTS "Expense_userId_idx" ON "Expense"("userId");
CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense"(date);
CREATE INDEX IF NOT EXISTS "Expense_currency_idx" ON "Expense"(currency);

-- إضافة المستخدمين الافتراضيين
-- ADMIN: username = admin, password = admin123
-- USER: username = user, password = user123
-- الهاش أدناه لكلمة المرور admin123 و user123 (bcrypt)
INSERT INTO "User" (id, username, password, role, "createdAt", "updatedAt")
VALUES 
    ('clx1admin000001', 'admin', '$2a$10$rOJ3qKVHZ8JqPxK5YvGxLO5vZ4qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('clx1user0000001', 'user', '$2a$10$rOJ3qKVHZ8JqPxK5YvGxLO5vZ4qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- ملاحظات مهمة:
-- 1. قم بتشغيل هذا السكريبت في SQL Editor في Supabase
-- 2. بعد التشغيل، استخدم: npx prisma db seed لإضافة المستخدمين بكلمات مرور صحيحة
-- 3. الهاش أعلاه للتوضيح فقط - استخدم الـ seed لإنشاء هاش صحيح
-- ============================================
