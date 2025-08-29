import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="">
      <div className="flex  w-full mt-20">
        <div className="flex h-96 flex-1 flex-col justify-around p-3 text-xl">
          <h1 className="text-2xl font-semibold">
            Turn Your Resume Into a Job-Winning Document in Minutes
          </h1>
          <p className="w-4/5 text-lg">
            <span>
              Building the perfect resume can be tough. Our AI tool makes it
              simple—instantly fixing typos, improving wording, and optimizing
              for ATS. Just upload your resume and get back a polished,
              recruiter-ready version with practical tips to boost your chances.
            </span>
          </p>

          <Link
            href={"/find"}
            className="w-fit rounded-md bg-blue-700 p-1.5 text-zinc-100"
          >
            Find Job
          </Link>
        </div>

        <div className="h-96 w-1/2 flex-1">dsd</div>
      </div>
    </div>
  );
};

export default page;
