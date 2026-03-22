-- إنشاء جدول المستخدمين (Users)
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- إنشاء جدول المهام (Tasks)
CREATE TABLE IF NOT EXISTS "Task" (
    id TEXT PRIMARY KEY,
    "taskName" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    deadline TIMESTAMP(3) NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    "collaboratorName" TEXT,
    "collaboratorCut" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "netProfit" DOUBLE PRECISION NOT NULL,
    status TEXT DEFAULT 'To Do' NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- إنشاء جدول المصاريف (Expenses)
CREATE TABLE IF NOT EXISTS "Expense" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    category TEXT NOT NULL,
    date TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- إنشاء الـ Indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"(email);
CREATE INDEX IF NOT EXISTS "Task_userId_idx" ON "Task"("userId");
CREATE INDEX IF NOT EXISTS "Task_deadline_idx" ON "Task"(deadline);
CREATE INDEX IF NOT EXISTS "Task_createdAt_idx" ON "Task"("createdAt");
CREATE INDEX IF NOT EXISTS "Expense_userId_idx" ON "Expense"("userId");
CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense"(date);
CREATE INDEX IF NOT EXISTS "Expense_category_idx" ON "Expense"(category);

-- إضافة المستخدمين الافتراضيين
-- كلمة المرور: password123 (مشفرة بـ bcrypt)
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES 
    ('admin001', 'admin@example.com', 'المدير', '$2a$10$YourBcryptHashHere1', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('user001', 'user1@example.com', 'المستخدم الأول', '$2a$10$YourBcryptHashHere2', 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('user002', 'user2@example.com', 'المستخدم الثاني', '$2a$10$YourBcryptHashHere3', 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
