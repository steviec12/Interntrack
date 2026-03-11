-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "reminderDate" TIMESTAMP(3),
ADD COLUMN     "reminderDone" BOOLEAN NOT NULL DEFAULT false;
