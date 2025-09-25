-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "Resume" TEXT,
ADD COLUMN     "SuggestedResume" TEXT,
ADD COLUMN     "field" TEXT,
ADD COLUMN     "improvement" TEXT[],
ADD COLUMN     "password" TEXT,
ADD COLUMN     "suggestion" TEXT[],
ADD COLUMN     "userResumeText" TEXT;
