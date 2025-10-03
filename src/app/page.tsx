"use client";
import { Play } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import UploadResume from "~/components/UploadResume";

const Page = () => {
  return (
    <div className="h-full">
      <div className="mt-20 flex w-full max-md:flex-col">
        <div className="flex h-96 flex-1 flex-col items-center justify-around gap-2 p-3 text-xl md:items-start">
          <h1 className="w-full text-2xl font-bold text-wrap max-md:text-center md:text-5xl">
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

          <Dialog>
            <DialogTrigger asChild>
              <Button className="px-4 py-2 text-base">Find Job</Button>
            </DialogTrigger>
            <DialogContent className="md:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Deploy your resume</DialogTitle>
              </DialogHeader>
              <div>
                <UploadResume />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="h-96 w-fit flex-1 max-sm:hidden md:w-1/2">
          <div className="relative h-full max-w-2xl rounded-md">
            <Image
              src={"/appPreview.png"}
              alt="appPreview"
              fill
              className="rounded-md border p-3 shadow-2xl"
            />


            <Play className="size-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black p-1"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
