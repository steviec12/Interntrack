-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected');

-- CreateEnum
CREATE TYPE "ApplicationType" AS ENUM ('Internship', 'FullTime');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT,
    "location" TEXT,
    "season" TEXT,
    "isRolling" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyName" TEXT NOT NULL,
    "reflectionNote" TEXT,
    "rejectionReason" TEXT,
    "roleTitle" TEXT NOT NULL,
    "salaryRange" TEXT,
    "dateApplied" TIMESTAMP(3),
    "status" "ApplicationStatus" NOT NULL DEFAULT 'Saved',
    "type" "ApplicationType" NOT NULL DEFAULT 'Internship',
    "deadline" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
