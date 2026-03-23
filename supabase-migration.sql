-- ============================================
-- Supabase Migration Script - بدون فقدان البيانات
-- تحديث من النظام القديم للنظام الجديد
-- ============================================

-- الخطوة 1: إنشاء الـ Enums الجديدة
DO $$ 
BEGIN
    -- إنشاء Role enum إذا لم يكن موجود
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
    END IF;

    -- إنشاء Currency enum إذا لم يكن موجود
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Currency') THEN
        CREATE TYPE "Currency" AS ENUM ('SAR', 'USD', 'EGP');
    END IF;

    -- إنشاء TaskStatus enum إذا لم يكن موجود
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskStatus') THEN
        CREATE TYPE "TaskStatus" AS ENUM ('ACTIVE', 'REVIEW', 'COMPLETED');
    END IF;
END $$;

-- ============================================
-- الخطوة 2: تحديث جدول User
-- ============================================

-- إضافة عمود username المؤقت
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS username_temp TEXT;

-- نسخ البيانات من email إلى username (إذا كان موجود)
UPDATE "User" SET username_temp = COALESCE(email, username) WHERE username_temp IS NULL;

-- إضافة عمود role المؤقت
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS role_temp "Role";

-- تحويل القيم القديمة للجديدة
UPDATE "User" 
SET role_temp = CASE 
    WHEN role = 'admin' OR role = 'ADMIN' THEN 'ADMIN'::"Role"
    ELSE 'USER'::"Role"
END
WHERE role_temp IS NULL;

-- حذف العمود القديم وإعادة تسمية الجديد
ALTER TABLE "User" DROP COLUMN IF EXISTS email;
ALTER TABLE "User" DROP COLUMN IF EXISTS name;
ALTER TABLE "User" DROP COLUMN IF EXISTS role CASCADE;
ALTER TABLE "User" RENAME COLUMN username_temp TO username;
ALTER TABLE "User" RENAME COLUMN role_temp TO role;

-- إضافة constraint للـ username
ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE (username);
ALTER TABLE "User" ALTER COLUMN username SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN role SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN role SET DEFAULT 'USER'::"Role";

-- ============================================
-- الخطوة 3: تحديث جدول Task
-- ============================================

-- إضافة عمود title المؤقت
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS title_temp TEXT;

-- نسخ البيانات من taskName إلى title
UPDATE "Task" SET title_temp = COALESCE("taskName", title) WHERE title_temp IS NULL;

-- إضافة أعمدة مؤقتة للـ enums
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS currency_temp "Currency";
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS status_temp "TaskStatus";

-- تحويل العملات
UPDATE "Task" 
SET currency_temp = CASE 
    WHEN currency = 'SAR' THEN 'SAR'::"Currency"
    WHEN currency = 'EGP' THEN 'EGP'::"Currency"
    ELSE 'USD'::"Currency"
END
WHERE currency_temp IS NULL;

-- تحويل الحالات
UPDATE "Task" 
SET status_temp = CASE 
    WHEN status IN ('DONE', 'COMPLETED', 'Done', 'Completed') THEN 'COMPLETED'::"TaskStatus"
    WHEN status IN ('IN_PROGRESS', 'REVIEW', 'In Progress', 'Review') THEN 'REVIEW'::"TaskStatus"
    ELSE 'ACTIVE'::"TaskStatus"
END
WHERE status_temp IS NULL;

-- حذف الأعمدة القديمة وإعادة التسمية
ALTER TABLE "Task" DROP COLUMN IF EXISTS "taskName" CASCADE;
ALTER TABLE "Task" DROP COLUMN IF EXISTS currency CASCADE;
ALTER TABLE "Task" DROP COLUMN IF EXISTS status CASCADE;

ALTER TABLE "Task" RENAME COLUMN title_temp TO title;
ALTER TABLE "Task" RENAME COLUMN currency_temp TO currency;
ALTER TABLE "Task" RENAME COLUMN status_temp TO status;

-- إضافة constraints
ALTER TABLE "Task" ALTER COLUMN title SET NOT NULL;
ALTER TABLE "Task" ALTER COLUMN currency SET NOT NULL;
ALTER TABLE "Task" ALTER COLUMN currency SET DEFAULT 'USD'::"Currency";
ALTER TABLE "Task" ALTER COLUMN status SET NOT NULL;
ALTER TABLE "Task" ALTER COLUMN status SET DEFAULT 'ACTIVE'::"TaskStatus";

-- ============================================
-- الخطوة 4: تحديث جدول Expense
-- ============================================

-- إضافة أعمدة جديدة
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS type_temp TEXT;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS description_temp TEXT;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS currency_temp "Currency";

-- نسخ البيانات
UPDATE "Expense" SET type_temp = COALESCE(name, category, type) WHERE type_temp IS NULL;
UPDATE "Expense" SET description_temp = description WHERE description_temp IS NULL;

-- تحويل العملة
UPDATE "Expense" 
SET currency_temp = CASE 
    WHEN currency = 'SAR' THEN 'SAR'::"Currency"
    WHEN currency = 'EGP' THEN 'EGP'::"Currency"
    ELSE 'USD'::"Currency"
END
WHERE currency_temp IS NULL;

-- حذف الأعمدة القديمة
ALTER TABLE "Expense" DROP COLUMN IF EXISTS name CASCADE;
ALTER TABLE "Expense" DROP COLUMN IF EXISTS category CASCADE;
ALTER TABLE "Expense" DROP COLUMN IF EXISTS currency CASCADE;

-- إعادة التسمية
ALTER TABLE "Expense" RENAME COLUMN type_temp TO type;
ALTER TABLE "Expense" RENAME COLUMN description_temp TO description;
ALTER TABLE "Expense" RENAME COLUMN currency_temp TO currency;

-- إضافة constraints
ALTER TABLE "Expense" ALTER COLUMN type SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN currency SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN currency SET DEFAULT 'USD'::"Currency";

-- ============================================
-- الخطوة 5: تحديث الـ Indexes
-- ============================================

-- حذف الـ indexes القديمة
DROP INDEX IF EXISTS "User_email_idx";
DROP INDEX IF EXISTS "Task_createdAt_idx";
DROP INDEX IF EXISTS "Expense_category_idx";

-- إضافة الـ indexes الجديدة
CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"(username);
CREATE INDEX IF NOT EXISTS "Task_status_idx" ON "Task"(status);
CREATE INDEX IF NOT EXISTS "Task_currency_idx" ON "Task"(currency);
CREATE INDEX IF NOT EXISTS "Expense_currency_idx" ON "Expense"(currency);

-- ============================================
-- الخطوة 6: تحديث المستخدمين (اختياري)
-- ============================================

-- إذا كنت تريد تحديث المستخدمين الموجودين
-- يمكنك تشغيل هذا الكود بعد التأكد من البيانات

-- UPDATE "User" 
-- SET role = 'ADMIN'::"Role" 
-- WHERE username = 'admin';

-- ============================================
-- تم! ✅
-- البيانات القديمة تم الاحتفاظ بها وتحويلها للنظام الجديد
-- ============================================

-- للتحقق من النجاح:
SELECT 'Users' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Tasks', COUNT(*) FROM "Task"
UNION ALL
SELECT 'Expenses', COUNT(*) FROM "Expense";
