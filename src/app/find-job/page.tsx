import { redirect } from "next/navigation";
import React, { lazy, Suspense } from "react";
import Loader from "~/components/Loader";
import { checkIsAuthenticated } from "~/server/auth/checkIsAuthenticated";

const FindComp = lazy(() => import("~/components/Find"));
const page = async () => {
  const isAuthenticated = await checkIsAuthenticated();
  if (! isAuthenticated) {
    redirect("/");
  }
  return (
    <Suspense fallback={<Loader />}>
      <FindComp />
    </Suspense>
  );
};

export default page;
