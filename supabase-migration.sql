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

-- التحقق من وجود الجدول وإنشائه إذا لم يكن موجوداً
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

-- إذا كان الجدول موجود بالفعل، نحدثه
DO $$ 
BEGIN
    -- إضافة أعمدة جديدة إذا لم تكن موجودة
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Expense' AND column_name = 'type') THEN
        ALTER TABLE "Expense" ADD COLUMN type_temp TEXT;
        
        -- نسخ البيانات من name أو category إذا كانت موجودة
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Expense' AND column_name = 'name') THEN
            UPDATE "Expense" SET type_temp = name WHERE type_temp IS NULL;
            ALTER TABLE "Expense" DROP COLUMN name CASCADE;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Expense' AND column_name = 'category') THEN
            UPDATE "Expense" SET type_temp = category WHERE type_temp IS NULL;
            ALTER TABLE "Expense" DROP COLUMN category CASCADE;
        END IF;
        
        ALTER TABLE "Expense" RENAME COLUMN type_temp TO type;
        ALTER TABLE "Expense" ALTER COLUMN type SET NOT NULL;
    END IF;

    -- تحديث عمود description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Expense' AND column_name = 'description') THEN
        ALTER TABLE "Expense" ADD COLUMN description TEXT;
    END IF;

    -- تحديث عمود currency
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Expense' AND column_name = 'currency' AND data_type = 'text') THEN
        -- العمود موجود كـ TEXT، نحوله لـ Enum
        ALTER TABLE "Expense" ADD COLUMN currency_temp "Currency";
        
        UPDATE "Expense" 
        SET currency_temp = CASE 
            WHEN currency = 'SAR' THEN 'SAR'::"Currency"
            WHEN currency = 'EGP' THEN 'EGP'::"Currency"
            ELSE 'USD'::"Currency"
        END
        WHERE currency_temp IS NULL;
        
        ALTER TABLE "Expense" DROP COLUMN currency CASCADE;
        ALTER TABLE "Expense" RENAME COLUMN currency_temp TO currency;
        ALTER TABLE "Expense" ALTER COLUMN currency SET NOT NULL;
        ALTER TABLE "Expense" ALTER COLUMN currency SET DEFAULT 'USD'::"Currency";
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Expense' AND column_name = 'currency') THEN
        -- العمود غير موجود، نضيفه
        ALTER TABLE "Expense" ADD COLUMN currency "Currency" DEFAULT 'USD' NOT NULL;
    END IF;
END $$;

-- ============================================
-- الخطوة 5: تحديث الـ Indexes
-- ============================================

-- حذف الـ indexes القديمة (إذا كانت موجودة)
DROP INDEX IF EXISTS "User_email_idx";
DROP INDEX IF EXISTS "Task_createdAt_idx";
DROP INDEX IF EXISTS "Expense_category_idx";
DROP INDEX IF EXISTS "Expense_name_idx";

-- إضافة الـ indexes الجديدة
CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"(username);
CREATE INDEX IF NOT EXISTS "Task_userId_idx" ON "Task"("userId");
CREATE INDEX IF NOT EXISTS "Task_deadline_idx" ON "Task"(deadline);
CREATE INDEX IF NOT EXISTS "Task_status_idx" ON "Task"(status);
CREATE INDEX IF NOT EXISTS "Task_currency_idx" ON "Task"(currency);
CREATE INDEX IF NOT EXISTS "Expense_userId_idx" ON "Expense"("userId");
CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense"(date);
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
