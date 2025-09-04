import { Loader2, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { MapPin, DollarSign, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

interface JobCardProps {
  employer_name: string;
  employer_logo?: string;
  job_title: string;
  job_description: string;
  job_location: string;
  job_country: string;
  job_salary_min?: number | null;
  job_salary_max?: number | null;
  job_publisher: string;
  job_apply_link: string;
}

const Jobs = ({ fetchedQuery }: { fetchedQuery: string }) => {
  const [location, setLocation] = useState<string>("");
  const [query, setQuery] = useState<string>(fetchedQuery);
  const [page, setPage] = useState<number>(1);
  const [dataHold, setDataHold] = useState<JobCardProps[]>([]);
  const [debounceQuery, setDebounceQuery] = useState<string>(fetchedQuery);

  const { data, isLoading, error, isFetching } = api.getjobs.getJobs.useQuery({
    query: debounceQuery,
    location: location ?? "India",
    page: page,
  });

  useEffect(() => {
    const timeOut = setTimeout(() => setDebounceQuery(query), 2000);
    return () => clearTimeout(timeOut);
  }, [query]);

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
      <nav>
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
                setPage(1); // reset pagination on new search
                setQuery(e.target.value);
              }}
              className="rounded-md border border-zinc-700 p-1"
            />
          </DialogContent>
        </Dialog>
      </nav>

      {dataHold.map((job: JobCardProps, index: number) => {
        const shortDescription = job.job_description.slice(0, 150);
        return (
          <Card
            key={`${job.job_title}-${index}`}
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

              {/* Publisher / Platform */}
              <p className="text-xs text-gray-500">
                Listed on:{" "}
                <span className="font-medium">{job.job_publisher}</span>
              </p>

              <Button asChild className="mt-3 w-full">
                <a
                  href={job.job_apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply Now
                </a>
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex w-full flex-col items-center">
        {isFetching && (
          <Loader2 className="my-2 size-6 animate-spin text-gray-600" />
        )}
        <Button
          className="w-full text-2xl"
          disabled={isFetching}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Load More
        </Button>
      </div>
    </div>
  );
};

export default Jobs;
