/*
  Warnings:

  - You are about to drop the column `status` on the `UserPlan` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."UserPlan_status_idx";

-- AlterTable
ALTER TABLE "public"."UserPlan" DROP COLUMN "status";
