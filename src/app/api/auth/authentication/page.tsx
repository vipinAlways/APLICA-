import React from "react";
import SignIn from "./SignIn";

import { redirect } from "next/navigation";
import { checkIsAuthenticated } from "~/server/auth/checkIsAuthenticated";

const page: React.FC = async () => {
  const isAuthenticated = await checkIsAuthenticated();
  if (isAuthenticated) {
    redirect("/");
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <SignIn />
    </div>
  );
};

export default page;
