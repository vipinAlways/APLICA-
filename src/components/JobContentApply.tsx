import Link from "next/link";
import React, { useState } from "react";
import { cn } from "~/lib/utils";
import type { JobCardProps } from "~/type/types";
import { Button } from "./ui/button";
import { useIsMobile } from "~/hooks/use-mobile";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

const JobContentApply = ({ job }: { job: JobCardProps }) => {
  const [data, setData] = useState("");
  const [activeTab, setActiveTab] = useState("fitScore");
  const isMobile = useIsMobile();

  const {
    mutate,
    isPending,
    data: fitData,
  } = api.pdfRoute.AccordingToJob.useMutation({
    mutationKey: ["getFitScore"],
    onSuccess: () => toast("here what you want"),
  });

  const navConsts = [
    {
      title: "aboutJob",
      Component: (
        <div className="flex h-80 flex-1 flex-col gap-1 overflow-y-auto text-sm text-wrap md:text-base">
          <h1 className="flex flex-col text-base font-medium lg:text-xl">
            <span className="font-semibold">Role :</span>{" "}
            <span>{job.job_title}</span>
          </h1>
          <h4>
            Expected Salary {job.job_salary_min} - {job.job_salary_max}
          </h4>
          <h4>Location &#128205; {job.job_location}</h4>

          <p>{job.job_description}</p>

          <ul>
            <h1>Qualification</h1>
            {/* {job.job_highlights.Qualifications.map((highlight:string, index:number) => (
              <li key={index}>{highlight}</li>
            ))} */}
          </ul>
          <p className="text-wrap break-words">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis
            similique officiis necessitatibus explicabo id pariatur ut illo eum.
            Rem voluptate quidem rerum aspernatur ut repudiandae eius magni ab
            odit modi. Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Quas ad, labore atque harum consectetur beatae quae dignissimos
            repellat iure quisquam maiores autem nihil accusamus quod commodi at
            obcaecati, soluta eum. Lorem ipsum dolor sit amet consectetur,
            adipisicing elit. Perferendis distinctio, id inventore porro sit
            impedit ad cupiditate consequatur, nobis natus laborum aspernatur
            saepe fuga provident. Illum asperiores quod, laboriosam quis ipsum
            eaque nemo perspiciatis? Tempore ad porro quod adipisci laboriosam?
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique
            temporibus voluptatibus dolorem vel et, omnis saepe asperiores fugit
            provident, laudantium pariatur nam sint porro totam distinctio at?
            Nulla repellat cum impedit quos quae commodi facere laudantium
            totam, vero natus saepe inventore? Debitis, quisquam similique
            ducimus sunt et quasi eos esse natus deleniti pariatur odio harum
            earum dolorum nostrum, laboriosam minima.
          </p>
        </div>
      ),
    },
    {
      title: "fitScore",

      Component: (
        <div className="flex w-full items-center gap-1 text-xl">
          <h1>Fit Score</h1>

          {!data ? (
            <Button
              onClick={() =>
                mutate({
                  jobTitle: job.job_title,
                  jobDescription: job.job_description,
                })
              }
            >
              Get You Fit Score
            </Button>
          ) : (
            <p
              className={cn(
                "bg-muted-foreground relative flex h-10 w-32 items-center justify-center rounded-lg p-2",
                "before:absolute before:top-0 before:left-0 before:z-0 before:h-full before:w-[30%] before:rounded-lg before:content-['']",
                !fitData
                  ? "hidden"
                  : fitData.fit_score < 40
                    ? "before:bg-red-700"
                    : fitData.fit_score < 80
                      ? "before:bg-amber-800"
                      : "before:bg-green-600",
              )}
            >
              <span className="relative z-10 text-white">
                {fitData && fitData.fit_score}/10{" "}
              </span>
            </p>
          )}
        </div>
      ),
    },
    {
      title: "F",
      Component: (
        <div className="h-full w-full overflow-y-auto rounded-lg bg-white p-3">
          <p className="text-gray-500">No mistakes found 🎉</p>
        </div>
      ),
    },
    {
      title: "Improved Resume",

      Component: (
        <div className="h-full w-full">
          <p className="text-gray-500">No polished resume yet</p>
        </div>
      ),
    },

    {
      title: "Mistakes",

      Component: (
        <div className="h-full w-full overflow-y-auto rounded-lg bg-white p-3">
          <p className="text-gray-500">No mistakes found 🎉</p>
        </div>
      ),
    },
  ];
  if (isPending) {
    return <Loader2Icon className="size-5 animate-spin" />;
  }
  return (
    <div className="w-full space-y-6 p-1">
      <div className="flex h-96 gap-3">
        {!isMobile && (
          <div className="flex min-h-80 flex-1 flex-col gap-1 overflow-y-auto text-sm text-wrap md:text-base">
            <h1 className="text-2xl font-bold">About Job</h1>
            <h2 className="flex flex-col text-base font-medium lg:text-xl">
              <span className="font-semibold">Role :</span>{" "}
              <span>{job.job_title}</span>
            </h2>
            <h4>
              Expected Salary {job.job_salary_min} - {job.job_salary_max}
            </h4>
            <h4>Location &#128205; {job.job_location}</h4>

            <p>{job.job_description}</p>

            <ul>
              <h1>Qualification</h1>
              {/* {job.job_highlights.Qualifications.map((highlight:string, index:number) => (
              <li key={index}>{highlight}</li>
            ))} */}
            </ul>
            <p className="text-wrap break-words">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Reiciendis similique officiis necessitatibus explicabo id pariatur
              ut illo eum. Rem voluptate quidem rerum aspernatur ut repudiandae
              eius magni ab odit modi. Lorem ipsum dolor sit amet consectetur
              adipisicing elit. Quas ad, labore atque harum consectetur beatae
              quae dignissimos repellat iure quisquam maiores autem nihil
              accusamus quod commodi at obcaecati, soluta eum. Lorem ipsum dolor
              sit amet consectetur, adipisicing elit. Perferendis distinctio, id
              inventore porro sit impedit ad cupiditate consequatur, nobis natus
              laborum aspernatur saepe fuga provident. Illum asperiores quod,
              laboriosam quis ipsum eaque nemo perspiciatis? Tempore ad porro
              quod adipisci laboriosam? Lorem ipsum dolor sit amet consectetur
              adipisicing elit. Similique temporibus voluptatibus dolorem vel
              et, omnis saepe asperiores fugit provident, laudantium pariatur
              nam sint porro totam distinctio at? Nulla repellat cum impedit
              quos quae commodi facere laudantium totam, vero natus saepe
              inventore? Debitis, quisquam similique ducimus sunt et quasi eos
              esse natus deleniti pariatur odio harum earum dolorum nostrum,
              laboriosam minima.
            </p>
          </div>
        )}
        {/* <nav className="mb-3 flex w-full flex-nowrap gap-3 overflow-x-auto border-b pb-2">  
          {navConsts.map((item, index) => {
            if (!isMobile && index > 1) {
              return (
                <button
                  key={item.title}
                  className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium lg:text-base ${
                    activeTab === item.title
                      ? "bg-gray-200 text-black"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab(item.title)}
                >
                  {item.title}
                </button>
              );
            }
          })}
        </nav> */}
        <main className="flex h-60 flex-col gap-4 lg:h-96">
          <nav className="mb-3 flex w-full flex-nowrap gap-3 overflow-x-auto border-b pb-2">
            {navConsts.map((item, index) =>
              !isMobile ? (
                index > 0 && (
                  <button
                    key={item.title}
                    className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium lg:text-base ${
                      activeTab === item.title
                        ? "bg-gray-200 text-black"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab(item.title)}
                  >
                    {item.title}
                  </button>
                )
              ) : (
                <button
                  key={item.title}
                  className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium lg:text-base ${
                    activeTab === item.title
                      ? "bg-gray-200 text-black"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab(item.title)}
                >
                  {item.title}
                </button>
              ),
            )}
          </nav>
          <section className="w-full flex-1 overflow-x-auto">
            <div>
              {navConsts.find((tab) => tab.title === activeTab)?.Component}
            </div>
          </section>
        </main>
      </div>
      <footer>
        <Link
          href={job.job_apply_link}
          className="bg-secondary-foreground text-secondary rounded-md p-2"
        >
          Apply here
        </Link>
      </footer>
    </div>
  );
};

export default JobContentApply;
