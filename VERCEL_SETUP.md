# 🚀 نشر المشروع على Vercel مع Supabase

## الخطوة 1: إعداد قاعدة البيانات على Supabase

### تشغيل Migrations على Supabase

قبل النشر، يجب إنشاء الجداول في Supabase:

```bash
# تأكد من أن .env يحتوي على رابط Supabase
DATABASE_URL="postgresql://postgres:apKaxAomojcB7kFv@db.fgpjuvexovpmnymtaybf.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:apKaxAomojcB7kFv@db.fgpjuvexovpmnymtaybf.supabase.co:5432/postgres"

# حذف migrations القديمة (SQLite)
Remove-Item -Path "prisma\migrations" -Recurse -Force

# إنشاء migration جديد للـ PostgreSQL
npx prisma migrate dev --name init_postgresql

# أو استخدم db push (أسرع)
npx prisma db push

# إضافة المستخدمين الافتراضيين
npx prisma db seed
```

---

## الخطوة 2: النشر على Vercel

### 1️⃣ اذهب إلى [vercel.com](https://vercel.com)

### 2️⃣ سجل دخول بحساب GitHub

### 3️⃣ اضغط **"Add New Project"**

### 4️⃣ اختر repository: **Mostafarizk1/task-manager**

### 5️⃣ إعدادات Build:
- **Framework Preset**: Next.js ✅ (يتم اكتشافه تلقائياً)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 6️⃣ أضف Environment Variables:

اضغط على **"Environment Variables"** وأضف:

```
DATABASE_URL
postgresql://postgres:apKaxAomojcB7kFv@db.fgpjuvexovpmnymtaybf.supabase.co:5432/postgres

DIRECT_URL
postgresql://postgres:apKaxAomojcB7kFv@db.fgpjuvexovpmnymtaybf.supabase.co:5432/postgres

NEXTAUTH_SECRET
0dRcE90ITlDSHorPwUFtrIUOQBAqmEoBzGKSCa8avUU=

NEXTAUTH_URL
https://your-project-name.vercel.app
```

**ملاحظة مهمة**: 
- بعد أول deployment، سيعطيك Vercel رابط المشروع
- ارجع لـ Environment Variables وحدث `NEXTAUTH_URL` بالرابط الفعلي
- اضغط **Redeploy** لتطبيق التغيير

### 7️⃣ اضغط **"Deploy"** 🚀

---

## الخطوة 3: بعد النشر

### تحديث NEXTAUTH_URL

1. بعد نجاح النشر، انسخ رابط المشروع (مثل: `https://task-manager-xyz.vercel.app`)
2. اذهب إلى **Settings** → **Environment Variables**
3. عدل `NEXTAUTH_URL` وضع الرابط الفعلي
4. اضغط **Save**
5. اذهب إلى **Deployments** → اضغط على آخر deployment → **Redeploy**

---

## الخطوة 4: تشغيل Seed على Supabase (إنشاء المستخدمين)

بعد نجاح النشر، شغل من جهازك:

```bash
# تأكد من أن .env يشير لـ Supabase
npx prisma db seed
```

أو يمكنك إضافة المستخدمين يدوياً من Supabase Dashboard:
1. اذهب إلى **Table Editor** → **User**
2. اضغط **Insert** → **Insert row**
3. أضف:
   - email: `admin@example.com`
   - name: `المدير`
   - password: `$2a$10$...` (استخدم bcrypt hash)
   - role: `admin`

---

## 🎯 بيانات الدخول

بعد seed:
- **Admin**: `admin@example.com` / `password123`
- **User 1**: `user1@example.com` / `password123`
- **User 2**: `user2@example.com` / `password456`

---

## ⚠️ استكشاف الأخطاء

### خطأ: "Can't reach database server"
- تأكد من أن `DATABASE_URL` صحيح في Vercel Environment Variables
- تأكد من أن كلمة المرور صحيحة
- تأكد من أن Supabase project نشط (Healthy)

### خطأ: "Table does not exist"
- شغل `npx prisma db push` من جهازك
- أو شغل migrations على Supabase

### خطأ في NextAuth
- تأكد من أن `NEXTAUTH_URL` يطابق رابط Vercel بالضبط
- تأكد من أن `NEXTAUTH_SECRET` موجود

---

## 📊 مراقبة المشروع

- **Vercel Dashboard**: شاهد logs والأخطاء
- **Supabase Dashboard**: شاهد قاعدة البيانات والجداول
- **Table Editor**: أضف/عدل/احذف البيانات مباشرة

---

## 🔄 التحديثات المستقبلية

عند تعديل الكود:
1. اعمل commit و push للـ GitHub
2. Vercel سيعمل deploy تلقائياً!

عند تعديل قاعدة البيانات:
1. عدل `schema.prisma`
2. شغل `npx prisma db push`
3. اعمل commit و push

---

**المشروع جاهز للنشر! 🎉**
