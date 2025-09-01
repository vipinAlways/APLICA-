"use client";
import React from "react";
import { api } from "~/trpc/react";

const Page = () => {
  const [user] = api.user.existingUser.useSuspenseQuery();
  
  
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="col-auto  grid h-full w-full grid-cols-2 gap-5 px-2">
        <div className="h-full rounded-lg  bg-white p-1">
          {user.Resume && (
            <iframe
              src={user.Resume}
              className="h-full w-full rounded-xl flex-1/3"
              frameBorder={0}
            />
          )}
        </div>
        <div className="h-full rounded-lg flex-1  p-2">
          aaaaaaaa
        </div>
      </div>
    </div>
  );
};

export default Page;  
