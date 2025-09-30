"use client";
import { Building, DollarSign, LogInIcon, MapPin, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import JobContentApply from "~/components/JobContentApply";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";

const Page = () => {
  const [jobs] = api.user.bookmarkJobs.useSuspenseQuery();
  const session = useSession();
  console.log({ jobs });
  if (!session.data) {
    return (
      <div className="mt-20 flex w-full flex-col items-center justify-center gap-4">
        <p className="text-3xl">Opp! Looks like not authenticated </p>
        <Link
          href={"/api/auth/authentication"}
          className="bg-muted flex w-fit items-center justify-center gap-2 rounded-md p-1.5 text-black"
        >
          Login <LogInIcon className="size-4" />{" "}
        </Link>
      </div>
    );
  }
  if (!jobs) {
    return <p>No data find</p>;
  }
  return (
    <div className="items-cente flex h-full w-full flex-wrap gap-4 gap-x-3">
      {jobs.JobCard.length > 0 ? (
        jobs.JobCard.map((job) => (
          <Card className="w-full max-w-xl rounded-2xl shadow-md" key={job.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              {job?.employer_logo ? (
                <Image
                  src={job.employer_logo}
                  alt={job.employer_name}
                  height={40}
                  width={40}
                  className="h-12 w-12 rounded-full border object-contain"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                  <Building className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg font-semibold">
                  {job?.job_title}
                </CardTitle>
                <p className="text-sm text-gray-500">{job?.employer_name}</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>
                  {job?.job_location}, {job?.job_country}
                </span>
              </div>

              {job?.job_salary_min !== 0 || job?.job_salary_max !== 0 ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {job?.job_salary_min
                      ? `$${job.job_salary_min.toLocaleString()}`
                      : ""}
                    {job?.job_salary_max
                      ? ` - $${job.job_salary_max.toLocaleString()}`
                      : ""}
                  </span>
                </div>
              ) : (
                <div>
                  Not Disclosed
                </div>
              )}

              <p className="text-sm text-gray-700"></p>
              <p className="text-xs text-gray-500">
                Listed on:{" "}
                <span className="font-medium">{job?.job_publisher}</span>
              </p>

              <Dialog>
                <DialogTrigger asChild rel="noopener noreferrer">
                  <Button>Apply Now</Button>
                </DialogTrigger>

                <DialogContent className="flex md:h-4/5   max-w-sm flex-col gap-4 sm:min-w-4xl">
                  <DialogHeader className="flex h-10 w-full items-center justify-center">
                    <DialogTitle>
                      <i>Aplica-</i>
                    </DialogTitle>
                    <DialogDescription>Apply here</DialogDescription>
                  </DialogHeader>

                  <div className="">
                    <JobContentApply job={job} />
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-muted-foreground mt-10 flex h-full w-full flex-col items-center justify-center gap-2">
          <p className="flex-1 text-2xl">No bookmarks</p>

          <Link
            href={"/find"}
            className="flex w-fit flex-1 items-center gap-1 text-lg"
          >
            <span> Search Some</span> <Search className="size-5" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Page;
