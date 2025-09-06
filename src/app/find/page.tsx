import { Loader2 } from "lucide-react";
import React, { Suspense } from "react";

import Find from "~/components/Find";
import { api } from "~/trpc/server";

const Page = async () => {
  // await api.user.existingUser.
  return (
    <Suspense fallback={<Loader2 className="mx-auto size-5 animate-spin" />}>
      <Find />
    </Suspense>
  );
};

export default Page;
