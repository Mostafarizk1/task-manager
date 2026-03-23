# دليل تحديث Supabase - بدون فقدان البيانات 🔄

## ⚠️ مهم جداً!

**لا تحذف القاعدة!** استخدم سكريبت الترحيل للحفاظ على بياناتك.

---

## 📋 متى تستخدم كل سكريبت؟

### 1️⃣ `supabase-setup.sql` - للقاعدة الجديدة فقط
**استخدمه فقط إذا:**
- ✅ قاعدة البيانات فاضية تماماً
- ✅ أول مرة تنشئ المشروع
- ✅ مش عندك بيانات مهمة

### 2️⃣ `supabase-migration.sql` - للتحديث مع الحفاظ على البيانات
**استخدمه إذا:**
- ✅ عندك بيانات موجودة
- ✅ عايز تحدث النظام
- ✅ مش عايز تفقد أي حاجة

---

## 🚀 خطوات التحديث (مع الحفاظ على البيانات)

### الخطوة 1: نسخ احتياطي (احتياطي فقط)

في Supabase SQL Editor:
```sql
-- نسخ احتياطي سريع
SELECT * FROM "User";
SELECT * FROM "Task";
SELECT * FROM "Expense";
```
احفظ النتائج في ملف Excel أو CSV (احتياطي فقط).

---

### الخطوة 2: تشغيل سكريبت الترحيل

1. **افتح Supabase Dashboard**
2. **اذهب إلى SQL Editor**
3. **افتح ملف `supabase-migration.sql`**
4. **انسخ كل المحتوى**
5. **الصقه في SQL Editor**
6. **اضغط Run** (أو Ctrl+Enter)

⏱️ **الوقت المتوقع:** 5-10 ثواني

---

### الخطوة 3: التحقق من النجاح

بعد تشغيل السكريبت، شغّل هذا الاستعلام:
```sql
-- التحقق من عدد السجلات
SELECT 'Users' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Tasks', COUNT(*) FROM "Task"
UNION ALL
SELECT 'Expenses', COUNT(*) FROM "Expense";
```

**يجب أن تشاهد:**
- ✅ نفس عدد السجلات القديمة
- ✅ لا توجد أخطاء

---

### الخطوة 4: التحقق من البنية

في **Table Editor**، تحقق من:

**جدول User:**
- ✅ عمود `username` (بدلاً من email)
- ✅ عمود `role` من نوع Enum (ADMIN/USER)
- ✅ لا يوجد عمود `email` أو `name`

**جدول Task:**
- ✅ عمود `title` (بدلاً من taskName)
- ✅ عمود `currency` من نوع Enum (SAR/USD/EGP)
- ✅ عمود `status` من نوع Enum (ACTIVE/REVIEW/COMPLETED)

**جدول Expense:**
- ✅ عمود `type` (بدلاً من name)
- ✅ عمود `description` (بدلاً من category)
- ✅ عمود `currency` من نوع Enum

---

## 🔄 ماذا يفعل السكريبت؟

### تحويل البيانات تلقائياً:

**User:**
- `email` → `username`
- `role: 'admin'` → `role: ADMIN`
- `role: 'user'` → `role: USER`

**Task:**
- `taskName` → `title`
- `currency: 'USD'` → `currency: USD` (Enum)
- `status: 'DONE'` → `status: COMPLETED`
- `status: 'IN_PROGRESS'` → `status: REVIEW`
- `status: 'TODO'` → `status: ACTIVE`

**Expense:**
- `name` → `type`
- `category` → `description`
- `currency: 'SAR'` → `currency: SAR` (Enum)

---

## ✅ بعد التحديث

### 1. اختبر تسجيل الدخول

إذا كان عندك مستخدم بـ email: `admin@example.com`
- الآن username: `admin@example.com`
- نفس كلمة المرور

### 2. تحديث المستخدمين (اختياري)

إذا عايز تغير usernames:
```sql
-- مثال: تغيير username من email لاسم بسيط
UPDATE "User" 
SET username = 'admin' 
WHERE username = 'admin@example.com';

UPDATE "User" 
SET username = 'user1' 
WHERE username = 'user1@example.com';
```

### 3. تحديث الأدوار (اختياري)

```sql
-- جعل مستخدم معين ADMIN
UPDATE "User" 
SET role = 'ADMIN'::"Role" 
WHERE username = 'admin';
```

---

## 🆘 حل المشاكل

### مشكلة: "type already exists"
**الحل:** السكريبت يتحقق تلقائياً، لكن إذا ظهرت المشكلة:
```sql
-- احذف الـ types القديمة
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "Currency" CASCADE;
DROP TYPE IF EXISTS "TaskStatus" CASCADE;

-- ثم شغّل السكريبت مرة أخرى
```

### مشكلة: "column does not exist"
**الحل:** تأكد إنك شغلت السكريبت كاملاً من الأول للآخر.

### مشكلة: فقدان بيانات
**الحل:** استخدم النسخة الاحتياطية من الخطوة 1.

---

## 📊 مقارنة السكريبتات

| الميزة | setup.sql | migration.sql |
|--------|-----------|---------------|
| قاعدة جديدة | ✅ | ❌ |
| قاعدة موجودة | ❌ | ✅ |
| يحذف البيانات | ✅ | ❌ |
| يحفظ البيانات | ❌ | ✅ |
| التحويل التلقائي | ❌ | ✅ |

---

## 💡 نصائح مهمة

1. **دائماً استخدم migration.sql** للتحديثات المستقبلية
2. **لا تحذف القاعدة** إلا إذا كانت فاضية
3. **اختبر في بيئة تطوير** أولاً إذا أمكن
4. **احفظ نسخة احتياطية** قبل أي تحديث كبير

---

## 🎯 الخلاصة

### للمرة الأولى (قاعدة فاضية):
```
استخدم: supabase-setup.sql
```

### للتحديثات (قاعدة فيها بيانات):
```
استخدم: supabase-migration.sql
```

---

**الآن بياناتك محفوظة والنظام محدث! 🎉**
