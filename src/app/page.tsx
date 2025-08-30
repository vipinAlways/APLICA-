"use client";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react"; // ✅ TRPC client hook (adjust path if needed)

const Page = () => {
  const [resume, setResume] = useState<string>("");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreViewUrl] = useState<string>("");

  return (
    <div className="h-full">
      <div className="mt-20 flex w-full max-md:flex-col">
        <div className="flex h-96 flex-1 flex-col items-center justify-around p-3 text-xl md:items-start">
          <h1 className="w-full text-[1.7rem] font-bold text-wrap max-md:text-center md:text-5xl">
            Turn Your Resume Into a Job Winning Document in Minutes
          </h1>
          <p className="text-lg max-md:text-center md:w-4/5">
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

        <div className="h-96 w-full flex-1 md:w-1/2"></div>
      </div>
    </div>
  );
};

export default Page;
