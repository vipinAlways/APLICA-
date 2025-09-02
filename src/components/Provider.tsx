"use client";
import { SessionProvider, useSession } from "next-auth/react";

import React, { useEffect, useState } from "react";
import { TRPCReactProvider } from "~/trpc/react";


const Provider = ({ children }: { children: React.ReactNode }) => {
  const [mount, setMount] = useState(false);
  


  useEffect(() => setMount(true), [mount]);
  
  if (!mount) return null;


  return (
    <TRPCReactProvider>
      <SessionProvider>
        <div>{children}</div>
         
      </SessionProvider>
    </TRPCReactProvider>
  );
};

export default Provider;
