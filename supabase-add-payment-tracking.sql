-- ============================================
-- إضافة حقول تتبع الدفع والتسليم للمهام
-- Add Payment Tracking Fields to Tasks
-- ============================================

-- إضافة الحقول الجديدة لجدول Task
ALTER TABLE "Task" 
ADD COLUMN IF NOT EXISTS "advancePayment" DOUBLE PRECISION DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS "advancePaymentCurrency" "Currency" DEFAULT 'USD' NOT NULL,
ADD COLUMN IF NOT EXISTS "isFullyDelivered" BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "isFullyPaid" BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "collaboratorPaid" BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "collaboratorPaidAmount" DOUBLE PRECISION DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS "collaboratorPaidCurrency" "Currency" DEFAULT 'USD' NOT NULL;

-- ============================================
-- ملاحظات:
-- 1. advancePayment: المبلغ المقدم من العميل
-- 2. advancePaymentCurrency: عملة المبلغ المقدم
-- 3. isFullyDelivered: هل تم تسليم العمل بالكامل
-- 4. isFullyPaid: هل تم دفع المبلغ بالكامل
-- 5. collaboratorPaid: هل تم تحويل فلوس المتعاون
-- 6. collaboratorPaidAmount: المبلغ المحول للمتعاون
-- 7. collaboratorPaidCurrency: عملة المبلغ المحول للمتعاون
-- ============================================
