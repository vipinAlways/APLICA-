"use client";
import { Building, DollarSign, MapPin } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
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
import type { JobCardProps } from "~/type/types";

const page = () => {
  const [job] = useState<JobCardProps>();
  return (
    <div>
      <Card className="w-full max-w-xl rounded-2xl shadow-md">
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

          {(job?.job_salary_min ?? job?.job_salary_max) && (
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
          )}

          <p className="text-sm text-gray-700"></p>
          <p className="text-xs text-gray-500">
            Listed on: <span className="font-medium">{job?.job_publisher}</span>
          </p>

          <Dialog>
            <DialogTrigger asChild rel="noopener noreferrer">
              <Button>Apply Now</Button>
            </DialogTrigger>

            <DialogContent className="flex h-4/5 max-w-sm flex-col gap-4 sm:min-w-4xl">
              <DialogHeader className="flex h-10 w-full items-center justify-center">
                <DialogTitle>
                  <i>Aplica-</i>
                </DialogTitle>
                <DialogDescription>Apply here</DialogDescription>
              </DialogHeader>

              <div className="">
                <JobContentApply job={job!} />
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
