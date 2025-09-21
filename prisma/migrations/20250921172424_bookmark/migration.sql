-- CreateTable
CREATE TABLE "public"."JobCard" (
    "id" TEXT NOT NULL,
    "employer_name" TEXT NOT NULL,
    "employer_logo" TEXT,
    "job_title" TEXT NOT NULL,
    "job_description" TEXT NOT NULL,
    "job_location" TEXT NOT NULL,
    "job_country" TEXT NOT NULL,
    "job_salary_min" INTEGER,
    "job_salary_max" INTEGER,
    "job_publisher" TEXT NOT NULL,
    "job_apply_link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobCard_pkey" PRIMARY KEY ("id")
);
