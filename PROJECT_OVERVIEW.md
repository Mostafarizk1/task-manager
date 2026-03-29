# 📋 Task Manager - نظام إدارة المهام والمشاريع

## 🎯 الهدف من النظام

نظام شامل لإدارة المهام والمشاريع مع تتبع الأرباح والمصروفات، مصمم للعمل الحر (Freelancing) وإدارة الفرق. يدعم النظام متابعة المشاريع من البداية للنهاية مع تتبع دقيق للدفعات والمتعاونين.

---

## 👥 الأدوار (Roles)

### 1. **ADMIN** (المدير)
- رؤية جميع المهام (الشخصية + مهام الفريق)
- إدارة المستخدمين (تغيير الأدوار، إضافة أرقام تليفونات)
- رؤية الأرباح والإحصائيات الكاملة
- صلاحيات كاملة على النظام

### 2. **USER** (المستخدم)
- رؤية مهامه الشخصية فقط
- إضافة وتعديل مهامه
- تتبع أرباحه ومصروفاته
- تغيير كلمة المرور

---

## 📊 الميزات الرئيسية

### 1. **إدارة المهام (Tasks)**

#### معلومات المهمة الأساسية:
- **عنوان المهمة** - اسم المشروع
- **اسم العميل** - صاحب المشروع
- **الموعد النهائي** - تاريخ التسليم
- **السعر الإجمالي** - قيمة المشروع
- **العملة** - USD, SAR, EGP
- **اسم المتعاون** - (اختياري) إذا كان هناك شريك
- **نصيب المتعاون** - المبلغ المستحق للمتعاون
- **صافي الربح** - يحسب تلقائياً (السعر - نصيب المتعاون)
- **الحالة** - ACTIVE, REVIEW, COMPLETED

#### تتبع الدفعات:
- **المبلغ المقدم** - المبلغ الذي دفعه العميل مقدماً
- **عملة المبلغ المقدم**

#### عند إتمام المهمة (COMPLETED):
نافذة تظهر تلقائياً تسأل:
1. **هل تم تسليم العمل بالكامل؟** (نعم/لا)
2. **هل تم دفع المبلغ بالكامل؟** (نعم/لا)
   - إذا "لا" → إدخال المبلغ المدفوع والباقي يحسب تلقائياً
3. **هل تم تحويل فلوس المتعاون؟** (نعم/لا) - يظهر فقط إذا كان هناك متعاون

#### عرض بيانات الإتمام:
بعد إتمام المهمة، تظهر في كارت المهمة:
```
التسليم: ✅ تم التسليم  أو  ❌ لم يتم
الدفع: ✅ تم الدفع بالكامل  أو  ⚠️ مدفوع 200 - باقي 200
المتعاون: ✅ تم التحويل  أو  ❌ لم يتم
```

---

### 2. **الإحصائيات الشهرية**

يتم حساب تلقائياً:
- **إجمالي الإيرادات** - مفصلة حسب العملة (USD, SAR, EGP)
- **إجمالي المصروفات** - مفصلة حسب العملة
- **صافي الربح** - مفصل حسب العملة
- **عدد المهام المكتملة** - في الشهر الحالي

---

### 3. **إدارة المصروفات (Expenses)**

- **النوع** - تصنيف المصروف
- **المبلغ** - قيمة المصروف
- **العملة** - USD, SAR, EGP
- **الوصف** - تفاصيل اختيارية
- **التاريخ** - يتم تسجيله تلقائياً

---

### 4. **لوحة الإدارة (Admin Panel)**

**متاحة للـ ADMIN فقط:**
- عرض جميع المستخدمين
- إحصائيات كل مستخدم:
  - إجمالي المهام
  - المهام المكتملة
  - إجمالي الإيرادات
- **تغيير دور المستخدم** (USER ↔ ADMIN)
- **إدارة أرقام التليفونات**:
  - عرض وتعديل رقم تليفون كل مستخدم
  - إضافة رقم تليفون للـ ADMIN نفسه

---

### 5. **تنبيهات Telegram**

**نظام تنبيهات تلقائي عبر Telegram Bot:**

#### التوقيت:
- **3 مرات يومياً** (الأحد - الخميس فقط):
  - 🌅 9 صباحاً (بتوقيت مصر)
  - ☀️ 12 ظهراً (بتوقيت مصر)
  - 🌙 7 مساءً (بتوقيت مصر)
- **الجمعة والسبت**: راحة - لا توجد تنبيهات

#### محتوى التنبيه:
```
🔔 تنبيه يومي - Task Manager

⚠️ مهام متأخرة:
• تصميم موقع ABC - متأخر بـ 2 يوم
  العميل: شركة XYZ

⏰ مهام قريبة (خلال 3 أيام):
• تطوير تطبيق DEF - باقي يومين
  العميل: محمد أحمد

📊 إجمالي المهام النشطة: 5
```

#### الإعداد:
- **Telegram Bot**: `@Mostafarizknotifications_bot`
- **المتغيرات المطلوبة في Vercel**:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`
  - `CRON_SECRET`

---

### 6. **تحسينات UX**

- **Auto-scroll للفورم**: عند تعديل مهمة، الصفحة تنزل تلقائياً للفورم (بدون scroll يدوي)
- **أزرار نعم/لا**: في نافذة الإتمام بدلاً من checkboxes
- **حساب تلقائي**: المبلغ الباقي يحسب تلقائياً عند إدخال المبلغ المدفوع
- **فصل المهام**: الـ ADMIN يشوف مهامه الشخصية منفصلة عن مهام الفريق

---

## 🗄️ قاعدة البيانات (Supabase + PostgreSQL)

### الجداول الرئيسية:

#### 1. **User** (المستخدمين)
```prisma
- id: String (cuid)
- username: String (unique)
- password: String (hashed with bcrypt)
- role: Role (ADMIN or USER)
- phoneNumber: String? (optional)
- createdAt: DateTime
- updatedAt: DateTime
```

#### 2. **Task** (المهام)
```prisma
- id: String (cuid)
- title: String
- clientName: String
- deadline: DateTime
- totalPrice: Float
- currency: Currency (USD, SAR, EGP)
- collaboratorName: String?
- collaboratorCut: Float
- netProfit: Float
- status: TaskStatus (ACTIVE, REVIEW, COMPLETED)
- userId: String (foreign key)

// Payment tracking
- advancePayment: Float
- advancePaymentCurrency: Currency
- isFullyDelivered: Boolean
- isFullyPaid: Boolean
- clientPaidAmount: Float
- clientRemainingAmount: Float
- collaboratorPaid: Boolean
- collaboratorPaidAmount: Float
- collaboratorPaidCurrency: Currency

- createdAt: DateTime
- updatedAt: DateTime
```

#### 3. **Expense** (المصروفات)
```prisma
- id: String (cuid)
- type: String
- amount: Float
- currency: Currency
- description: String?
- date: DateTime
- userId: String (foreign key)
- createdAt: DateTime
- updatedAt: DateTime
```

---

## 🔐 المصادقة (Authentication)

- **NextAuth.js** - نظام المصادقة
- **Credentials Provider** - تسجيل دخول بـ username/password
- **bcrypt** - تشفير كلمات المرور
- **Session Management** - إدارة الجلسات

---

## 🛠️ التقنيات المستخدمة

### Frontend:
- **Next.js 15** - React Framework
- **TypeScript** - Type Safety
- **TailwindCSS** - Styling
- **next-auth** - Authentication

### Backend:
- **Next.js API Routes** - Serverless Functions
- **Prisma ORM** - Database ORM
- **Supabase** - PostgreSQL Database

### Deployment:
- **Vercel** - Hosting & Deployment
- **Vercel Cron Jobs** - Scheduled Tasks (Telegram notifications)

### External Services:
- **Telegram Bot API** - Push Notifications

---

## 📁 هيكل المشروع

```
task-manager/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth routes
│   │   ├── tasks/         # Task CRUD operations
│   │   ├── expenses/      # Expense CRUD operations
│   │   ├── users/         # User management
│   │   │   └── [id]/
│   │   │       ├── role/  # Change user role
│   │   │       └── phone/ # Update phone number
│   │   └── cron/
│   │       └── check-deadlines/  # Telegram notifications
│   ├── admin/
│   │   └── panel/         # Admin panel page
│   ├── dashboard/         # Main dashboard
│   └── login/             # Login page
├── components/
│   ├── TasksDashboard.tsx      # Main tasks component
│   └── AdminPanelClient.tsx    # Admin panel component
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   └── telegram.ts        # Telegram bot utilities
├── prisma/
│   └── schema.prisma      # Database schema
├── supabase-setup.sql     # Initial database setup
├── supabase-migration.sql # Migration script
├── supabase-add-payment-tracking.sql
├── supabase-add-phone-numbers.sql
├── supabase-add-payment-details.sql
└── TELEGRAM_SETUP.md      # Telegram bot setup guide
```

---

## 🚀 الإعداد والتشغيل

### 1. المتغيرات البيئية (.env):
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://your-app.vercel.app"
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_CHAT_ID="..."
CRON_SECRET="..."
```

### 2. تشغيل Migrations في Supabase:
```sql
-- بالترتيب:
1. supabase-setup.sql
2. supabase-migration.sql
3. supabase-add-payment-tracking.sql
4. supabase-add-phone-numbers.sql
5. supabase-add-payment-details.sql
```

### 3. تشغيل محلياً:
```bash
npm install
npx prisma generate
npm run dev
```

---

## 📝 ملاحظات مهمة

### الأمان:
- ✅ كلمات المرور مشفرة بـ bcrypt
- ✅ Session-based authentication
- ✅ Role-based access control
- ✅ CRON_SECRET لحماية Cron Jobs

### الأداء:
- ✅ Serverless functions (auto-scaling)
- ✅ Database indexes على الحقول المهمة
- ✅ Optimistic UI updates

### الصيانة:
- ✅ TypeScript للـ type safety
- ✅ Prisma ORM لسهولة إدارة Database
- ✅ Environment variables للـ configuration
- ✅ SQL migration files للـ version control

---

## 🔄 سير العمل (Workflow)

### إضافة مهمة جديدة:
1. المستخدم يدخل بيانات المهمة
2. النظام يحسب صافي الربح تلقائياً
3. المهمة تُحفظ بحالة ACTIVE
4. تظهر في قائمة المهام

### إتمام مهمة:
1. المستخدم يغير الحالة لـ COMPLETED
2. نافذة تظهر تسأل عن:
   - التسليم
   - الدفع (مع المبالغ إذا جزئي)
   - المتعاون
3. البيانات تُحفظ في Database
4. تظهر حالة الإتمام في كارت المهمة

### التنبيهات اليومية:
1. Vercel Cron Job يشتغل في الأوقات المحددة
2. API يجلب المهام القريبة والمتأخرة
3. رسالة تُرسل عبر Telegram Bot
4. المستخدم يستلم التنبيه على تليفونه

---

## 📞 الدعم والتواصل

- **Telegram Bot**: `@Mostafarizknotifications_bot`
- **Deployment**: Vercel
- **Database**: Supabase

---

## 🎯 الخطط المستقبلية (اختياري)

- [ ] تقارير PDF للمهام والأرباح
- [ ] رسوم بيانية للإحصائيات
- [ ] تصدير البيانات (Excel/CSV)
- [ ] تطبيق موبايل (React Native)
- [ ] دعم المزيد من العملات
- [ ] نظام الفواتير (Invoicing)

---

**آخر تحديث**: مارس 2026
**الإصدار**: 1.0
**المطور**: Cascade AI Assistant
