"use client";
import {  File, FileIcon, ListStart, Loader2, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { api } from "~/trpc/react";

const Page = () => {
  const utils = api.useUtils();
  const [activeTab, setActiveTab] = useState("Resume");
  const hasRunRef = useRef(false);

  const [user] = api.user.existingUser.useSuspenseQuery();

  
  const { mutate, isPending,isError } =
    api.pdfRoute.textextractAndImproveMent.useMutation({
      mutationKey: ["text and suggestion", user.Resume],
      onSuccess: () => utils.user.existingUser.invalidate(),
    });

  
  useEffect(() => {
    if (user?.Resume && !hasRunRef.current) {
      hasRunRef.current = true;
      mutate({ pdfUrl: user.Resume });
    }
  }, [user?.Resume, mutate]);


  let userImprovedResumeUrl ;

  const convertTextIntoResume = useCallback(()=>{
    
  },[user.SuggestedResume])
  const navConsts = [
    {
      title: "Resume",
      Icon: File,
      Component: (
        <div className="h-full w-full">
          {user.Resume ? (
            <iframe
              src={user.Resume}
              className="h-full w-full rounded-xl"
              frameBorder={0}
            />
          ) : (
            <p>No resume uploaded</p>
          )}
        </div>
      ),
    },
    {
      title: "Suggestion",
      Icon: ListStart,
      Component: (
        <div className="h-full w-full overflow-y-auto rounded-lg bg-white p-3">
          {!isPending && user.suggestion && user.suggestion?.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5">
              {user.suggestion.map((m: string, i: number) => (
                <li key={i} className="text-sm text-gray-700">
                  {m}
                </li>
              ))}
            </ul>
          ) : (
            !isPending && <p className="text-gray-500">No mistakes found 🎉</p>
          )}
        </div>
      ),
    },
    {
      title: "Improved Resume",
      Icon: FileIcon,
      Component: (
        <div>
          <ul>{user.SuggestedResume}</ul>
        </div>
      ),
    },

    {
      title: "Mistakes",
      Icon: X,
      Component: (
        <div className="h-full w-full overflow-y-auto rounded-lg bg-white p-3">
          {!isPending && user.improvement && user.improvement?.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5">
              {user.improvement.map((m: string, i: number) => (
                <li key={i} className="text-sm text-gray-700">
                  {m}
                </li>
              ))}
            </ul>
          ) : (
            !isPending && <p className="text-gray-500">No mistakes found 🎉</p>
          )}
        </div>
      ),
    },
  ];

  if (isPending) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if(isError){
    return <X className=""/>
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="col-auto grid h-full w-full grid-cols-2 gap-5 px-2">
        <div className="h-full rounded-lg bg-white p-1">
          <nav className="mb-3 flex gap-3 border-b pb-2">
            {navConsts.map((item) => (
              <button
                key={item.title}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium ${
                  activeTab === item.title
                    ? "bg-gray-200 text-black"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab(item.title)}
              >
                <item.Icon className="size-4" />
                {item.title}
              </button>
            ))}
          </nav>
          <div className="h-[calc(100%-2.5rem)]">
            {navConsts.find((tab) => tab.title === activeTab)?.Component}
          </div>
        </div>
        <div className="h-full flex-1 rounded-lg p-2"></div>
      </div>
    </div>
  );
};

export default Page;
