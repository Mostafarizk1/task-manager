# إعداد Supabase - دليل سريع 🚀

## الخطوة 1: إنشاء حساب Supabase

1. اذهب إلى [https://supabase.com](https://supabase.com)
2. اضغط **Start your project**
3. سجل دخول باستخدام GitHub أو البريد الإلكتروني

## الخطوة 2: إنشاء مشروع جديد

1. اضغط **New Project**
2. اختر Organization (أو أنشئ واحدة جديدة)
3. املأ البيانات:
   - **Name**: task-manager (أو أي اسم تريده)
   - **Database Password**: اختر كلمة مرور قوية واحفظها! 🔐
   - **Region**: اختر أقرب منطقة لك (مثل: Europe West)
   - **Pricing Plan**: Free (مجاني)
4. اضغط **Create new project**
5. انتظر 1-2 دقيقة حتى يتم إنشاء المشروع

## الخطوة 3: الحصول على رابط قاعدة البيانات

1. من لوحة تحكم المشروع، اذهب إلى:
   **Settings** (الإعدادات) → **Database** (قاعدة البيانات)

2. ابحث عن قسم **Connection string** (رابط الاتصال)

3. اختر **URI** من القائمة المنسدلة

4. انسخ الرابط الذي يبدأ بـ:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

5. **مهم جداً**: استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها في الخطوة 2

## الخطوة 4: إعداد ملف البيئة (.env)

1. في مجلد المشروع، انسخ ملف `.env.example` إلى `.env`:
   ```bash
   copy .env.example .env
   ```

2. افتح ملف `.env` وضع الرابط الذي نسخته:
   ```env
   DATABASE_URL="postgresql://postgres:كلمة_المرور_هنا@db.xxxxx.supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:كلمة_المرور_هنا@db.xxxxx.supabase.co:5432/postgres"
   
   NEXTAUTH_SECRET="اختر_نص_عشوائي_طويل_هنا"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. لتوليد `NEXTAUTH_SECRET` قوي، شغل هذا الأمر:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

## الخطوة 5: تثبيت المكتبات وإنشاء قاعدة البيانات

```bash
# تثبيت المكتبات
npm install

# إنشاء جداول قاعدة البيانات
npx prisma migrate dev --name init

# إضافة المستخدمين الافتراضيين
npx prisma db seed
```

## الخطوة 6: تشغيل المشروع

```bash
npm run dev
```

افتح المتصفح على: **http://localhost:3000**

---

## 🔑 بيانات الدخول الافتراضية

- **المستخدم الأول**: `user1@example.com` / `password123`
- **المستخدم الثاني**: `user2@example.com` / `password456`

---

## 🎯 أدوات مفيدة

### عرض قاعدة البيانات في Supabase
1. اذهب إلى لوحة تحكم Supabase
2. اضغط **Table Editor** من القائمة الجانبية
3. ستجد جداول `User` و `Task`

### عرض قاعدة البيانات محلياً
```bash
npx prisma studio
```
سيفتح واجهة رسومية على `http://localhost:5555`

---

## ⚠️ ملاحظات مهمة

1. **لا تشارك ملف `.env`** مع أحد - يحتوي على معلومات حساسة
2. **احفظ كلمة مرور قاعدة البيانات** في مكان آمن
3. الخطة المجانية من Supabase تتيح:
   - 500 MB مساحة تخزين
   - 2 GB نقل بيانات شهرياً
   - مشروعين مجانيين
   - كافية جداً لمكتب من شخصين!

---

## 🆘 حل المشاكل الشائعة

### خطأ: "Can't reach database server"
- تأكد من أن رابط قاعدة البيانات صحيح
- تأكد من استبدال `[YOUR-PASSWORD]` بكلمة المرور الفعلية
- تأكد من اتصالك بالإنترنت

### خطأ: "Authentication failed"
- تأكد من كلمة المرور في رابط الاتصال
- إذا كانت كلمة المرور تحتوي على رموز خاصة، قد تحتاج لترميزها (URL encoding)

### خطأ: "Prisma Client not generated"
```bash
npx prisma generate
```

---

## 🎉 تم!

الآن لديك نظام إدارة مهام متصل بقاعدة بيانات أونلاين يمكن الوصول إليها من أي مكان!
