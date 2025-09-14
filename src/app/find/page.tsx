"use client";
import { Loader2 } from "lucide-react";
import React, { lazy, Suspense } from "react";


import Loader from "~/components/Loader";
import { api } from "~/trpc/server";
const FindComp = lazy(() => import("~/components/Find"));

const Page = () => {
  return (
    <Suspense fallback={<Loader/>}>
      <FindComp />
    </Suspense>
  );
};

export default Page;
