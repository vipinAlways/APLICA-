"use client";

import React, { lazy } from "react";
// import Feature from "~/components/Feature";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import UploadResume from "~/components/UploadResume";

const LazyHowWork = lazy(() => import("~/components/HowWork"));
const LazyTestimonials = lazy(() => import("~/components/Testimonials"));

const Page = () => {
  return (
    <div className="h-full">
      <div className="mt-20 w-full space-y-10">
        <div className="flex w-full items-center justify-center">
          <div className="flex h-96 max-w-2xl flex-1 flex-col items-center justify-center gap-2 p-3 text-xl">
            <h1 className="text-center text-2xl font-bold md:text-5xl">
              Turn Your Resume Into a Job Winning Document in Minutes
            </h1>
            <p className="text-center text-lg md:w-4/5">
              <span>
                Building the perfect resume can be tough. Our AI tool makes it
                simple—instantly fixing typos, improving wording, and optimizing
                for ATS. Just upload your resume and get back a polished,
                recruiter-ready version with practical tips to boost your
                chances.
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
        </div>

        {/* <Feature /> */}
        <LazyHowWork />

        <LazyTestimonials />
      </div>
    </div>
  );
};

export default Page;
