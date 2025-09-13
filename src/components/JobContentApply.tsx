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
        <div className="relative flex w-full flex-col items-center gap-1 text-xl">
          {!fitData ? (
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
            <div className="">
              <div className="sticky top-0 left-0 flex items-center justify-around border-b border-b-black pb-4">
                <h1 className="font-semibold">Fit Score</h1>
                <p className="bg-muted-foreground relative flex h-10 w-32 items-center justify-center overflow-hidden rounded-lg p-2">
                  <span
                    className={cn(
                      "absolute top-0 left-0 h-full rounded-lg",
                      fitData?.fit_score < 40
                        ? "bg-red-700"
                        : fitData?.fit_score < 80
                          ? "bg-amber-800"
                          : "bg-green-600",
                    )}
                    style={{ width: `${fitData?.fit_score ?? 0}%` }}
                  />
                  <span className="relative z-10 text-white">
                    85/100 

                    {/* {fitData && fitData.fit_score}  */}
                  </span>
                </p>

                <br />
              </div>
              {/* <hr className="my-3 h-1 bg-zinc-950" /> */}
              <p className="mt-3 text-base">Consider adding a separate section for backend experience to highlight Node.js, Express.js, and Prisma skills.Quantify achievements by including metrics or statistics in project descriptions, such as 'Built real-time group music app with 10,000+ users'.Update the education section to include the expected graduation date and any relevant certifications or courses.  </p>
              {/* {fitData.improvements} */}
            </div>
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

  return (
    <div className="w-full space-y-6 p-1">
      <div className="flex h-96 w-full gap-3">
        {!isMobile && (
          <div className="flex min-h-[20rem] flex-1 flex-col gap-1 overflow-y-auto text-sm md:text-base">
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
              {/* qualifications mapping here */}
            </ul>

            <p className="break-words whitespace-normal text-base">
              Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur vero optio nihil a eaque illo architecto quia consequatur, sunt error amet ducimus sed, laboriosam veritatis laborum nemo cumque eos perspiciatis. Magni deserunt vero amet aperiam omnis soluta voluptates, distinctio incidunt?
            </p>
          </div>
        )}

        <main className="flex h-60 flex-1 flex-col gap-4 lg:h-96">
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

          <section className="flex-1 overflow-x-auto">
            <div>
              {isPending ? (
                <Loader2Icon className="size-6 animate-spin" />
              ) : (
                navConsts.find((tab) => tab.title === activeTab)?.Component
              )}
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
