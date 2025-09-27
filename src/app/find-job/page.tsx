import React, { lazy, Suspense } from "react";
import Loader from "~/components/Loader";

const FindComp = lazy(() => import("~/components/Find"));
const page = () => {
  return (
    <Suspense fallback={<Loader />}>
      <FindComp />
    </Suspense>
  );
};

export default page;
