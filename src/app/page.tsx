"use client";
import React, { useState } from "react";
import LocationSearch from "~/components/LocationSearch";
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
  const [selectedCity, setSelectedCity] = useState<string | undefined>("");
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(
    "",
  );
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

        <Dialog>
          <DialogTrigger className="flex items-center gap-1 rounded-lg border-2 border-zinc-400 p-2">
            Location
          </DialogTrigger>

          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Search Job</DialogTitle>
            </DialogHeader>

            <LocationSearch
              selectedCity={selectedCity}
              selectedCountry={selectedCountry}
              setSelectedCity={(value) => {
                setSelectedCity(value);
              }}
              setSelectedCountry={(value) => {
                setSelectedCountry(value);
                setSelectedCity("");
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Page;
