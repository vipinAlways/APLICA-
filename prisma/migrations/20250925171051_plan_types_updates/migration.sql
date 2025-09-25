/*
  Warnings:

  - The values [MEDIUM] on the enum `PlanType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PlanType_new" AS ENUM ('BASE', 'PRO', 'ELITE');
ALTER TABLE "public"."UserPlan" ALTER COLUMN "planType" DROP DEFAULT;
ALTER TABLE "public"."PaymentIntent" ALTER COLUMN "planType" TYPE "public"."PlanType_new" USING ("planType"::text::"public"."PlanType_new");
ALTER TABLE "public"."UserPlan" ALTER COLUMN "planType" TYPE "public"."PlanType_new" USING ("planType"::text::"public"."PlanType_new");
ALTER TYPE "public"."PlanType" RENAME TO "PlanType_old";
ALTER TYPE "public"."PlanType_new" RENAME TO "PlanType";
DROP TYPE "public"."PlanType_old";
ALTER TABLE "public"."UserPlan" ALTER COLUMN "planType" SET DEFAULT 'BASE';
COMMIT;
