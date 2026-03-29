-- Add phone number field to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;

-- Optional: Add index for faster phone number lookups
CREATE INDEX IF NOT EXISTS "User_phoneNumber_idx" ON "User"("phoneNumber");
