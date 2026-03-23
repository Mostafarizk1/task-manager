# دليل تحديث Supabase 🔄

## التحديثات الجديدة

تم تحديث النظام بالكامل ليشمل:
- ✅ نظام الصلاحيات (ADMIN/USER)
- ✅ دعم 3 عملات (SAR, USD, EGP)
- ✅ حالات المهام الجديدة (ACTIVE, REVIEW, COMPLETED)
- ✅ نظام المصاريف النثرية
- ✅ التقارير الشهرية

---

## ⚠️ مهم جداً: خطوات التحديث

### الطريقة 1: إنشاء قاعدة بيانات جديدة (موصى بها)

إذا كانت بياناتك الحالية غير مهمة:

#### 1. حذف الجداول القديمة في Supabase
```sql
-- في SQL Editor في Supabase، شغل:
DROP TABLE IF EXISTS "Expense" CASCADE;
DROP TABLE IF EXISTS "Task" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "Currency" CASCADE;
DROP TYPE IF EXISTS "TaskStatus" CASCADE;
```

#### 2. تشغيل السكريبت الجديد
1. افتح `supabase-setup.sql`
2. انسخ المحتوى كاملاً
3. اذهب إلى Supabase → SQL Editor
4. الصق السكريبت
5. اضغط **Run**

#### 3. تشغيل Prisma
```bash
# توليد Prisma Client
npx prisma generate

# دفع التغييرات
npx prisma db push

# إضافة المستخدمين بكلمات مرور صحيحة
npx prisma db seed
```

---

### الطريقة 2: الترحيل مع الحفاظ على البيانات

إذا كان لديك بيانات مهمة:

#### 1. نسخ احتياطي للبيانات
```sql
-- في SQL Editor، احفظ البيانات:
SELECT * FROM "User";
SELECT * FROM "Task";
SELECT * FROM "Expense";
```

#### 2. تحديث الجداول يدوياً

**تحديث جدول User:**
```sql
-- إنشاء Enum للـ Role
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- تحديث الجدول
ALTER TABLE "User" DROP COLUMN IF EXISTS email;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE "User" DROP COLUMN IF EXISTS name;
ALTER TABLE "User" ALTER COLUMN role TYPE "Role" USING 
  CASE 
    WHEN role = 'admin' THEN 'ADMIN'::"Role"
    ELSE 'USER'::"Role"
  END;
```

**تحديث جدول Task:**
```sql
-- إنشاء Enums
CREATE TYPE "Currency" AS ENUM ('SAR', 'USD', 'EGP');
CREATE TYPE "TaskStatus" AS ENUM ('ACTIVE', 'REVIEW', 'COMPLETED');

-- تحديث الجدول
ALTER TABLE "Task" RENAME COLUMN "taskName" TO title;
ALTER TABLE "Task" ALTER COLUMN currency TYPE "Currency" USING currency::"Currency";
ALTER TABLE "Task" ALTER COLUMN status TYPE "TaskStatus" USING 
  CASE 
    WHEN status = 'To Do' THEN 'ACTIVE'::"TaskStatus"
    WHEN status = 'In Progress' THEN 'REVIEW'::"TaskStatus"
    WHEN status = 'Done' THEN 'COMPLETED'::"TaskStatus"
    ELSE 'ACTIVE'::"TaskStatus"
  END;

-- إضافة Indexes جديدة
CREATE INDEX IF NOT EXISTS "Task_status_idx" ON "Task"(status);
CREATE INDEX IF NOT EXISTS "Task_currency_idx" ON "Task"(currency);
```

**تحديث جدول Expense:**
```sql
-- تحديث الجدول
ALTER TABLE "Expense" RENAME COLUMN name TO type;
ALTER TABLE "Expense" RENAME COLUMN category TO description;
ALTER TABLE "Expense" ALTER COLUMN currency TYPE "Currency" USING currency::"Currency";
ALTER TABLE "Expense" ALTER COLUMN description DROP NOT NULL;

-- إضافة Index جديد
CREATE INDEX IF NOT EXISTS "Expense_currency_idx" ON "Expense"(currency);
```

#### 3. تحديث Prisma
```bash
npx prisma db pull
npx prisma generate
```

---

## 🔍 التحقق من التحديث

بعد التحديث، تحقق من:

### 1. في Supabase Table Editor
- ✅ جدول `User` يحتوي على `username` بدلاً من `email`
- ✅ جدول `Task` يحتوي على `title` بدلاً من `taskName`
- ✅ جدول `Expense` يحتوي على `type` و `description`
- ✅ الـ Enums موجودة: `Role`, `Currency`, `TaskStatus`

### 2. اختبار تسجيل الدخول
```
ADMIN:
- username: admin
- password: admin123

USER:
- username: user
- password: user123
```

### 3. اختبار الصفحات
- `/dashboard` - يجب أن تعمل
- `/admin/expenses` - ADMIN فقط
- `/admin/reports` - ADMIN فقط

---

## 📊 الفروقات الرئيسية

| القديم | الجديد |
|--------|--------|
| `email` | `username` |
| `name` | حُذف |
| `taskName` | `title` |
| `role: 'admin'/'user'` | `role: ADMIN/USER` |
| `currency: 'USD'` | `currency: USD/SAR/EGP` |
| `status: 'To Do'` | `status: ACTIVE/REVIEW/COMPLETED` |
| `Expense.name` | `Expense.type` |
| `Expense.category` | `Expense.description` |

---

## 🆘 حل المشاكل

### خطأ: "type does not exist"
```sql
-- تأكد من إنشاء الـ Enums أولاً
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
CREATE TYPE "Currency" AS ENUM ('SAR', 'USD', 'EGP');
CREATE TYPE "TaskStatus" AS ENUM ('ACTIVE', 'REVIEW', 'COMPLETED');
```

### خطأ: "column does not exist"
```bash
# أعد توليد Prisma Client
npx prisma generate
npx prisma db push
```

### خطأ في تسجيل الدخول
```bash
# أعد تشغيل الـ seed
npx prisma db seed
```

---

## 📝 ملاحظات

1. **النسخ الاحتياطي**: احفظ نسخة من بياناتك قبل التحديث
2. **البيئة**: جرب التحديث في بيئة تطوير أولاً
3. **الـ Seed**: استخدم `npx prisma db seed` لإنشاء مستخدمين بكلمات مرور صحيحة
4. **الـ Enums**: PostgreSQL Enums لا يمكن تعديلها بسهولة - قد تحتاج لحذفها وإعادة إنشائها

---

## ✅ قائمة التحقق

- [ ] نسخ احتياطي للبيانات
- [ ] تشغيل سكريبت التحديث في Supabase
- [ ] تشغيل `npx prisma generate`
- [ ] تشغيل `npx prisma db push`
- [ ] تشغيل `npx prisma db seed`
- [ ] اختبار تسجيل الدخول (ADMIN & USER)
- [ ] اختبار إضافة مهمة
- [ ] اختبار المصاريف (ADMIN)
- [ ] اختبار التقارير (ADMIN)

---

**بعد التحديث، النظام جاهز بالكامل! 🎉**
