"use client";
import { Loader2, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { MapPin, DollarSign, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "./ui/dialog";

import type { JobCardProps } from "~/type/types";
import LocationSearch from "./LocationSearch";
import JobContentApply from "./JobContentApply";

const Jobs = ({ fetchedQuery }: { fetchedQuery: string }) => {
  const [query, setQuery] = useState(fetchedQuery);
  const [debounceQuery, setDebounceQuery] = useState(fetchedQuery);
  const [selected, setSelected] = useState("");
  const [page, setPage] = useState(1);
  const [dataHold, setDataHold] = useState<JobCardProps[]>([]);
  const [country, setCountry] = useState("");

  // const { data, isLoading, isFetching } = api.getjobs.getJobs.useQuery(
  //   {
  //     query: debounceQuery,
  //     country,
  //     page,
  //   },
  //   {
  //     enabled: debounceQuery.length >= 3,
  //   },
  // );

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => setDebounceQuery(query), 2000);
    return () => clearTimeout(timeout);
  }, [query]);

  const data: JobCardProps[] = [
    {
      employer_name: "TechNova Solutions",
      employer_logo: "https://via.placeholder.com/100x100.png?text=TechNova",
      job_title: "Frontend Developer",
      job_description:
        "We are looking for a skilled frontend developer experienced in React, TypeScript, and Tailwind CSS to join our growing team.",
      job_location: "Bengaluru, Karnataka",
      job_country: "India",
      job_salary_min: 600000,
      job_salary_max: 1200000,
      job_publisher: "Indeed",
      job_apply_link: "https://example.com/jobs/frontend-developer",
    },
    {
      employer_name: "FinEdge Corp",
      employer_logo: "https://via.placeholder.com/100x100.png?text=FinEdge",
      job_title: "Backend Engineer",
      job_description:
        "Seeking a backend engineer with expertise in Node.js, PostgreSQL, and cloud platforms (AWS/GCP) to build scalable financial systems.",
      job_location: "New York, NY",
      job_country: "USA",
      job_salary_min: 90000,
      job_salary_max: 140000,
      job_publisher: "LinkedIn",
      job_apply_link: "https://example.com/jobs/backend-engineer",
    },
  ];

  // Reset country when a new selection is made
  useEffect(() => {
    setCountry(selected);
    setPage(1); // reset pagination when country changes
    setDataHold([]); // clear old data
  }, [selected]);

  // Append new jobs when data is fetched
  // useEffect(() => {
  //   if (!isLoading && data?.data) {
  //     setDataHold((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
  //   }
  // }, [data, isLoading, page]);

  // if ((isLoading || !data) && dataHold.length === 0) {
  //   return (
  //     <div className="flex h-40 w-full items-center justify-center">
  //       <Loader2 className="size-6 animate-spin" />
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <nav className="w-full max-w-xl flex gap-1.5">
        <Dialog>
          <DialogTrigger className="flex items-center gap-1">
            {query ?? "Query"} <Search className="size-4" />
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Search Job</DialogTitle>
            </DialogHeader>
            <label>Type</label>
            <input
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              className="w-full rounded-md border border-zinc-700 p-1"
            />
          </DialogContent>
        </Dialog>

        <LocationSearch selected={selected} setSelected={setSelected} />
      </nav>

      {data.map((job: JobCardProps, index: number) => {
        const shortDescription = job.job_description.slice(0, 150);
        return (
          <Card
            key={`${index}`}
            className="w-full max-w-xl rounded-2xl shadow-md"
          >
            <CardHeader className="flex flex-row items-center gap-4">
              {job.employer_logo ? (
                <img
                  src={job.employer_logo}
                  alt={job.employer_name}
                  className="h-12 w-12 rounded-full border object-contain"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                  <Building className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg font-semibold">
                  {job.job_title}
                </CardTitle>
                <p className="text-sm text-gray-500">{job.employer_name}</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>
                  {job.job_location}, {job.job_country}
                </span>
              </div>

              {(job.job_salary_min || job.job_salary_max) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {job.job_salary_min
                      ? `$${job.job_salary_min.toLocaleString()}`
                      : ""}
                    {job.job_salary_max
                      ? ` - $${job.job_salary_max.toLocaleString()}`
                      : ""}
                  </span>
                </div>
              )}

              <p className="text-sm text-gray-700">{shortDescription}...</p>
              <p className="text-xs text-gray-500">
                Listed on:{" "}
                <span className="font-medium">{job.job_publisher}</span>
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
                    <JobContentApply job={job} />
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex w-full max-w-xl flex-col items-center justify-center rounded-2xl shadow-md">
        {/* {isFetching && (
          <Loader2 className="my-2 size-6 animate-spin text-gray-600" />
        )} */}
        <Button
          className="w-full text-2xl"
          // disabled={isFetching}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Find More
        </Button>
      </div>
    </div>
  );
};

export default Jobs;
