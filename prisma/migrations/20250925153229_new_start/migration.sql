/*
  Warnings:

  - You are about to drop the column `Resume` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `SuggestedResume` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `field` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `improvement` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `suggestion` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userResumeText` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PlanType" AS ENUM ('BASE', 'MEDIUM', 'PRO');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "Resume",
DROP COLUMN "SuggestedResume",
DROP COLUMN "field",
DROP COLUMN "improvement",
DROP COLUMN "password",
DROP COLUMN "plan",
DROP COLUMN "suggestion",
DROP COLUMN "userResumeText",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "public"."types";

-- CreateTable
CREATE TABLE "public"."PaymentIntent" (
    "id" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planType" "public"."PlanType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planType" "public"."PlanType" NOT NULL DEFAULT 'BASE',
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_stripePaymentIntentId_key" ON "public"."PaymentIntent"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "PaymentIntent_userId_idx" ON "public"."PaymentIntent"("userId");

-- CreateIndex
CREATE INDEX "PaymentIntent_status_idx" ON "public"."PaymentIntent"("status");

-- CreateIndex
CREATE INDEX "PaymentIntent_createdAt_idx" ON "public"."PaymentIntent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlan_userId_key" ON "public"."UserPlan"("userId");

-- CreateIndex
CREATE INDEX "UserPlan_userId_idx" ON "public"."UserPlan"("userId");

-- CreateIndex
CREATE INDEX "UserPlan_status_idx" ON "public"."UserPlan"("status");

-- CreateIndex
CREATE INDEX "UserPlan_planType_idx" ON "public"."UserPlan"("planType");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "public"."User"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "public"."PaymentIntent" ADD CONSTRAINT "PaymentIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPlan" ADD CONSTRAINT "UserPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
