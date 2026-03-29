-- Add client payment tracking fields to Task table
ALTER TABLE "Task" 
ADD COLUMN IF NOT EXISTS "clientPaidAmount" DOUBLE PRECISION DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS "clientRemainingAmount" DOUBLE PRECISION DEFAULT 0 NOT NULL;
