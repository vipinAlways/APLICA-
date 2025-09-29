import { Check, Mail } from "lucide-react";
import React from "react";

const page = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="flex h-fit max-w-xl flex-col items-center justify-center gap-4 rounded-lg bg-zinc-300 p-5 text-xl text-nowrap shadow-md transition-colors">
        <div className="group relative flex items-center justify-center">
          <svg width="120" height="120" className="circle">
            <circle cx="60" cy="60" r="50" className="stroke-[#008000]" />
          </svg>
          <Check className="tick absolute h-20 w-20 text-[#008000] opacity-100 transition-all duration-1000 ease-out" />
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-3xl">Mail Sent Successfully</h1>
          <p className="flex flex-col items-center justify-center gap-4 text-sm">
            {" "}
            Please check your inbox to verify your email.
          </p>
          <a
            href="https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox"
            className="flex w-fit items-center gap-4 rounded-md bg-blue-500 px-4 py-2 text-zinc-200 outline-0 transition-all duration-150 ease-out hover:bg-blue-600"
          >
            <Mail /> Mail
          </a>{" "}
        </div>
      </div>
    </div>
  );
};

export default page;
