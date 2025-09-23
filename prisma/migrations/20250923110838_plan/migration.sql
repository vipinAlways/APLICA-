-- CreateEnum
CREATE TYPE "public"."types" AS ENUM ('BASE', 'MEDIUM', 'PRO');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "numberOfCoverLetter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfEmail" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "plan" "public"."types" NOT NULL DEFAULT 'BASE';
