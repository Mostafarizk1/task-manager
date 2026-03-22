# نظام إدارة المهام - Task Manager

نظام ويب بسيط لإدارة المهام لمكتب يتكون من شخصين، مبني باستخدام Next.js و Tailwind CSS مع قاعدة بيانات SQLite.

## المميزات ✨

- 🔐 نظام تسجيل دخول آمن لمستخدمين اثنين
- 📋 إدارة كاملة للمهام (إضافة، تعديل، حذف، عرض)
- 💰 حساب تلقائي لصافي الربح
- 🌙 دعم الوضع الليلي (Dark Mode)
- 📅 ترتيب تلقائي حسب موعد التسليم الأقرب
- 🎨 واجهة مستخدم عصرية ونظيفة
- 📱 تصميم متجاوب (Responsive)

## التقنيات المستخدمة 🛠️

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Date Handling**: date-fns

## التثبيت والإعداد 🚀

### 1. إعداد Supabase (قاعدة البيانات الأونلاين)

اتبع الدليل الكامل في ملف **[SETUP_SUPABASE.md](./SETUP_SUPABASE.md)**

باختصار:
1. أنشئ حساب مجاني على [Supabase](https://supabase.com)
2. أنشئ مشروع جديد واحفظ كلمة المرور
3. احصل على رابط قاعدة البيانات من Settings → Database

### 2. إنشاء ملف البيئة

انسخ ملف `.env.example` إلى `.env`:

```bash
copy .env.example .env
```

ثم ضع رابط قاعدة البيانات من Supabase في `DATABASE_URL` و `DIRECT_URL`.

### 3. تثبيت المكتبات

```bash
npm install
```

### 4. إنشاء جداول قاعدة البيانات

```bash
# إنشاء الجداول في Supabase
npx prisma migrate dev --name init

# إضافة المستخدمين الافتراضيين
npx prisma db seed
```

### 4. تشغيل المشروع

```bash
npm run dev
```

افتح المتصفح على [http://localhost:3000](http://localhost:3000)

## بيانات الدخول الافتراضية 🔑

بعد تشغيل أمر `npx prisma db seed`:

- **المستخدم الأول**:
  - البريد: `user1@example.com`
  - كلمة المرور: `password123`

- **المستخدم الثاني**:
  - البريد: `user2@example.com`
  - كلمة المرور: `password456`

## هيكل المشروع 📁

```
task-manager/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   └── tasks/
│   ├── dashboard/
│   ├── login/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── DashboardClient.tsx
│   └── ThemeProvider.tsx
├── lib/
│   ├── auth.ts
│   └── prisma.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── next-auth.d.ts
└── package.json
```

## تفاصيل المهمة 📝

كل مهمة تحتوي على:

- **اسم المهمة**: عنوان المهمة
- **اسم العميل**: لتجنب نسيان العملاء
- **موعد التسليم**: تاريخ التسليم المتوقع
- **السعر الإجمالي**: قيمة المشروع الكاملة
- **اسم المساعد**: الشخص المساعد في المهمة (اختياري)
- **أجر المساعد**: المبلغ المدفوع للمساعد (اختياري)
- **صافي الربح**: يُحسب تلقائياً (السعر الإجمالي - أجر المساعد)
- **الحالة**: To Do, In Progress, أو Done

## الأوامر المتاحة 💻

```bash
# تشغيل المشروع في وضع التطوير
npm run dev

# بناء المشروع للإنتاج
npm run build

# تشغيل المشروع في وضع الإنتاج
npm start

# فحص الأكواد
npm run lint

# إعادة إنشاء Prisma Client
npx prisma generate

# فتح Prisma Studio لإدارة قاعدة البيانات
npx prisma studio
```

## ملاحظات مهمة ⚠️

- قاعدة البيانات مستضافة على Supabase (أونلاين)
- لا تنسى تغيير `NEXTAUTH_SECRET` في الإنتاج
- لا تشارك ملف `.env` - يحتوي على معلومات حساسة
- الخطة المجانية من Supabase كافية للاستخدام الشخصي
- يدعم مستخدمين اثنين فقط كما هو مطلوب

## الترخيص 📄

هذا المشروع مفتوح المصدر ومتاح للاستخدام الشخصي والتجاري.
