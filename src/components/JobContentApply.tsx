import Link from "next/link";
import React from "react";
import type { JobCardProps } from "~/type/types";

const JobContentApply = ({ job }: { job: JobCardProps }) => {
  return (
    <div>
      <main className="flex items-center gap-4">
        <section>
          <h1>{job.job_title}</h1>
          
          <p>{job.job_description}</p>
        </section>
        <section>
            <div>
                <h1>Fit Score</h1>
                
            </div>
        </section>
      </main>
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
