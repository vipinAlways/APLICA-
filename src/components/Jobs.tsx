"use client";
import { Loader2, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { MapPin, DollarSign, Building } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "./ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import type { JobCardProps } from "~/type/types";
import LocationSearch from "./LocationSearch";

const Jobs = ({ fetchedQuery }: { fetchedQuery: string }) => {
  const [query, setQuery] = useState(fetchedQuery);
  const [debounceQuery, setDebounceQuery] = useState(fetchedQuery);
  const [selected, setSelected] = useState("");
  const [page, setPage] = useState(1);
  const [dataHold, setDataHold] = useState<JobCardProps[]>([]);
  const [country, setCountry] = useState("");

  // TRPC query, only enabled if query >= 3
  const { data, isLoading, isFetching } = api.getjobs.getJobs.useQuery(
    {
      query: debounceQuery,
      country,
      page,
    },
    {
      enabled: debounceQuery.length >= 3, // skip invalid queries
    }
  );

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => setDebounceQuery(query), 2000);
    return () => clearTimeout(timeout);
  }, [query]);

  // Reset country when a new selection is made
  useEffect(() => {
    setCountry(selected);
    setPage(1); // reset pagination when country changes
    setDataHold([]); // clear old data
  }, [selected]);

  // Append new jobs when data is fetched
  useEffect(() => {
    if (!isLoading && data?.data) {
      setDataHold((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
    }
  }, [data, isLoading, page]);

  if ((isLoading || !data) && dataHold.length === 0) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <nav className="w-full max-w-xl">
        <Dialog>
          <DialogTrigger className="flex items-center gap-1">
            {query ?? "Query"} <Search className="size-4" />
          </DialogTrigger>
          <DialogContent>
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
              className="rounded-md border border-zinc-700 p-1 w-full"
            />
          </DialogContent>
        </Dialog>

        <LocationSearch selected={selected} setSelected={setSelected} />
      </nav>

      {dataHold.map((job: JobCardProps, index: number) => {
        const shortDescription = job.job_description.slice(0, 150);
        return (
          <Card key={`${job.job_title}-${index}`} className="w-full max-w-xl rounded-2xl shadow-md">
            <CardHeader className="flex flex-row items-center gap-4">
              {job.employer_logo ? (
                <img src={job.employer_logo} alt={job.employer_name} className="h-12 w-12 rounded-full border object-contain" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                  <Building className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg font-semibold">{job.job_title}</CardTitle>
                <p className="text-sm text-gray-500">{job.employer_name}</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{job.job_location}, {job.job_country}</span>
              </div>

              {(job.job_salary_min || job.job_salary_max) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {job.job_salary_min ? `$${job.job_salary_min.toLocaleString()}` : ""}
                    {job.job_salary_max ? ` - $${job.job_salary_max.toLocaleString()}` : ""}
                  </span>
                </div>
              )}

              <p className="text-sm text-gray-700">{shortDescription}...</p>
              <p className="text-xs text-gray-500">
                Listed on: <span className="font-medium">{job.job_publisher}</span>
              </p>

              <Button asChild className="mt-3 w-full">
                <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">
                  Apply Now
                </a>
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex w-full max-w-xl flex-col items-center justify-center rounded-2xl shadow-md">
        {isFetching && <Loader2 className="my-2 size-6 animate-spin text-gray-600" />}
        <Button className="w-full text-2xl" disabled={isFetching} onClick={() => setPage((prev) => prev + 1)}>
          Find More
        </Button>
      </div>
    </div>
  );
};

export default Jobs;
