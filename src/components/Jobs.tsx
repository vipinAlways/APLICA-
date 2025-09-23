"use client";
import {
  Bookmark,
  BookmarkCheck,
  Loader2,
  Loader2Icon,
  Search,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
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
import Image from "next/image";
import { api } from "~/trpc/react";
import { toast } from "sonner";

const Jobs = ({ fetchedQuery }: { fetchedQuery: string }) => {
  const [query, setQuery] = useState(fetchedQuery);
  const [debounceQuery, setDebounceQuery] = useState(fetchedQuery);
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [dataHold, setDataHold] = useState<JobCardProps[]>([]);
  const [country, setCountry] = useState("");
  const { data: bookmarks } = api.user.getBookmarks.useQuery();

  const { mutate, isPending } = api.user.addtoBookMark.useMutation({
    mutationKey: ["add-bookMark"],
    onSuccess: () => {
      toast("Added To Bookmark");
    },
    onError: () => {
      toast.error("Something Went Wrong");
    },
  });

  const { mutate: removeMutate, isPending: removerPending } =
    api.user.removeFromBookMark.useMutation({
      mutationKey: ["add-bookMark"],
      onSuccess: () => {
        toast("Added To Bookmark");
      },
      onError: () => {
        toast.error("Something Went Wrong");
      },
    });

  const { data, isLoading, isFetching } = api.getjobs.getJobs.useQuery(
    {
      query: debounceQuery,
      country,
      page,
    },
    {
      enabled: debounceQuery.length >= 3,
    },
  );

  useEffect(() => {
    const timeout = setTimeout(() => setDebounceQuery(query), 2000);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    setCountry(selected);
    setPage(1);
    setDataHold([]);
  }, [selected]);

  useEffect(() => {
    if (!isLoading && data) {
      setDataHold((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
    }
  }, [data, isLoading, page]);

  const handleBookMark = useCallback(
    (job: JobCardProps, remove: boolean) => {
      if (!remove) {
        mutate({
          id: job.job_id!,
          employer_name: job.employer_name,
          job_apply_link: job.job_apply_link,
          job_country: job.job_country,
          job_description: job.job_description,
          job_location: job.job_location,
          job_publisher: job.job_publisher,
          job_title: job.job_title,
          employer_logo: job.employer_logo ?? "",
          job_salary_max: job.job_salary_max ?? 0,
          job_salary_min: job.job_salary_min ?? 0,
        });
      } else {
        removeMutate({
          id: job.job_id!,
        });
      }
    },
    [mutate, removeMutate],
  );
  if ((isLoading || !data) && dataHold.length === 0) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2Icon className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <nav className="flex w-full max-w-xl items-start gap-10">
        <Dialog>
          <DialogTrigger className="flex items-center gap-1 rounded-lg border-2 border-zinc-400 p-2">
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

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="flex items-center gap-1 rounded-lg border-2 border-zinc-400 p-2">
            {selected ? selected : "Location"} <Search className="size-4" />
          </DialogTrigger>

          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Search Job</DialogTitle>
            </DialogHeader>

            <LocationSearch
              selected={selected}
              setSelected={(value) => {
                setSelected(value);
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </nav>

      {data?.data?.map((job: JobCardProps, index: number) => {
        const shortDescription = job.job_description.slice(0, 150);
        const isBookmarked = bookmarks?.JobCard?.some(
          (b) => b.id === job.job_id!,
        );
        return (
          <Card
            key={`${index}`}
            className="w-full max-w-xl rounded-2xl shadow-md"
          >
            <CardHeader className="flex flex-row items-center gap-4">
              {job.employer_logo ? (
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

              {(job.job_salary_min ?? job.job_salary_max) && (
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
                    <DialogTitle className="relative">
                      <i>Aplica-</i>{" "}
                      {isBookmarked ? (
                        <Button
                          onClick={() => handleBookMark(job, true)}
                          disabled={isPending}
                        >
                          <BookmarkCheck className="size-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleBookMark(job, false)}
                          disabled={removerPending}
                        >
                          <Bookmark className="size-4" />
                        </Button>
                      )}
                    </DialogTitle>

                    <DialogDescription>Apply here</DialogDescription>
                  </DialogHeader>

                  <div>
                    <JobContentApply job={job} />
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex w-full max-w-xl flex-col items-center justify-center rounded-2xl shadow-md">
        {isFetching && (
          <Loader2 className="my-2 size-6 animate-spin text-gray-600" />
        )}
        <Button
          className="w-full text-2xl"
          disabled={isFetching}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Find More
        </Button>
      </div>
    </div>
  );
};

export default Jobs;
