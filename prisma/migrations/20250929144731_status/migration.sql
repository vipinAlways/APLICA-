/*
  Warnings:

  - Changed the type of `status` on the `PaymentIntent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."status" AS ENUM ('PENDING', 'CANCEL', 'SUCCESS');

-- AlterTable
ALTER TABLE "public"."PaymentIntent" DROP COLUMN "status",
ADD COLUMN     "status" "public"."status" NOT NULL;

-- CreateIndex
CREATE INDEX "PaymentIntent_status_idx" ON "public"."PaymentIntent"("status");
