"use client";
import { File, FileIcon, ListStart, Loader2, X } from "lucide-react";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { api } from "~/trpc/react";
import Jobs from "~/components/Jobs";
import Loader from "./Loader";

const Find = () => {
  const [activeTab, setActiveTab] = useState("Resume");
  const [url, setPdfUrl] = useState<string>("");
  const { data: user, isLoading } = api.user.existingUser.useQuery();

  useEffect(() => {
    if (!user?.SuggestedResume) return;

    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    doc.setFont("courier", "normal");
    doc.setFontSize(12);

    const pageWidth = doc.internal.pageSize.getWidth() - 40;
    const lines = doc.splitTextToSize(`${user.SuggestedResume}`, pageWidth);

    let y = 20;
    lines.forEach((line: string) => {
      doc.text(line, 20, y);
      y += 9;
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
    });

    const blob = doc.output("blob");
    const objectUrl = URL.createObjectURL(blob);
    setPdfUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [user?.SuggestedResume]);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <p>server Error</p>;
  }
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
        <div className="h-full w-full overflow-y-auto rounded-lg  p-3">
          {user.suggestion && user.suggestion?.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5">
              {user.suggestion.map((m: string, i: number) => (
                <li key={i} className="text-sm text-gray-700">
                  {m}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No mistakes found 🎉</p>
          )}
        </div>
      ),
    },
    {
      title: "Improved Resume",
      Icon: FileIcon,
      Component: (
        <div className="h-full w-full p-2">
          {user.SuggestedResume && url ? (
            <textarea
              name="aiResume"
              id="ai"
              value={user.SuggestedResume}
              className="aiResume h-full w-full px-4 jobs"
              disabled
            ></textarea>
          ) : (
            <p className="text-gray-500">No polished resume yet</p>
          )}
        </div>
      ),
    },

    {
      title: "Mistakes",
      Icon: X,
      Component: (
        <div className="h-full w-full overflow-y-auto rounded-lg  p-3">
          {user.improvement && user.improvement?.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5">
              {user.improvement.map((m: string, i: number) => (
                <li key={i} className="text-sm text-gray-700">
                  {m}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No mistakes found 🎉</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen w-full items-center justify-center pb-2">
      <div className="relative grid h-full w-full grid-cols-2 gap-5 px-2 max-md:grid-cols-1">
        <div className="sticky top-0 h-full rounded-lg  p-1">
          <div className="flex h-full flex-col">
            <nav className="mb-3 flex w-full gap-3 overflow-x-auto border-b pb-2 ">
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
            <div className="flex-1 overflow-hidden bg-transparent  ">
              {navConsts.find((tab) => tab.title === activeTab)?.Component}
            </div>
          </div>
        </div>

        <div className="h-full flex-1 overflow-y-auto rounded-lg p-2 jobs">
          <Jobs fetchedQuery={user.field ?? ""} />
        </div>
      </div>
    </div>
  );
};

export default Find;
