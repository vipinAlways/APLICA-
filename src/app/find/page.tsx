import { File, FileIcon, ListStart, Loader2, X } from "lucide-react";
import React, { Suspense } from "react";
import { jsPDF } from "jspdf";
import { api } from "~/trpc/server";

import Find from "~/components/Find";

const Page = async () => {
  await api.user.existingUser.prefetch();

  return (
    <Suspense fallback={<Loader2 className="mx-auto size-5 animate-spin" />}>
      <Find />
    </Suspense>
  );
};

export default Page;
