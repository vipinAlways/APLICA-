"use client";

import { File, Loader2, MousePointerSquareDashed } from "lucide-react";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import Dropzone, { type FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { Progress } from "./ui/progress";
import { api } from "~/trpc/react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/app/api/uploadthing/core";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const { useUploadThing: useUT } = generateReactHelpers<OurFileRouter>();

const UploadResume = () => {
  const [isDrageOver, setisDrageOver] = useState(false);

  const [pdfFile, setPdfFile] = useState<File[]>();

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const router = useRouter();
  const [user] = api.user.existingUser.useSuspenseQuery();
  const { mutate, isPending } = api.user.uplaodResume.useMutation({
    onSuccess: () => router.push("/find"),
  });

  const { startUpload, isUploading } = useUT("pdfformUser", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        mutate({ resume: res[0].url });
      }
    },
  });

  const onDropRejected = (rejectedFile: FileRejection[]) => {
    setisDrageOver(false);
    if (!rejectedFile[0]) return;
    toast(`${rejectedFile[0].file.type} type is not supported`, {
      description: "Please choose a PDF file",
    });
  };

  const onDropAccepted = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setPdfFile([file]);
    setisDrageOver(false);
  }, []);

  const handleContinue = useCallback(async () => {
    if (!pdfFile && !user.Resume) {
      return toast("Not able to find file", {
        description: "Please try again, thank you.",
      });
    }
    if (user.Resume) {
      router.push("/find");
    } else {
      await startUpload(pdfFile!);
    }
  }, [pdfFile]);
  useEffect(() => {
    if (!pdfFile?.[0]) return;
    const url = URL.createObjectURL(pdfFile[0]);
    return () => URL.revokeObjectURL(url);
  }, [pdfFile]);

  return (
    <div className="w-full">
      <Suspense fallback={<Loader2 className="size-6 animate-spin" />}>
        <div className="mb-4 flex w-full justify-center">
          {user.Resume ? (
            <iframe src={user.Resume} className="h-72 w-4/5" />
          ) : (
            pdfFile &&
            pdfFile[0] && (
              <iframe
                src={user.Resume ?? URL.createObjectURL(pdfFile[0])}
                className="h-72 w-4/5"
              />
            )
          )}
        </div>{" "}
      </Suspense>

      <Dropzone
        onDropRejected={onDropRejected}
        onDropAccepted={onDropAccepted}
        accept={{
          "application/pdf": [".pdf"],
        }}
        onDragEnter={() => setisDrageOver(true)}
        onDragLeave={() => setisDrageOver(false)}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            className="flex h-full w-full flex-1 flex-col items-center justify-center"
            {...getRootProps()}
          >
            <input {...getInputProps()} />

            {isDrageOver ? (
              <MousePointerSquareDashed className="mb-2 h-6 w-6 text-zinc-500" />
            ) : isUploading || isPending ? (
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-zinc-500" />
            ) : (
              <File className="mb-2 h-6 w-6 text-zinc-500" />
            )}

            <div className="mb-2 flex flex-col justify-center text-sm text-zinc-700">
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <p>Uploading...</p>
                  <Progress
                    className="mt-2 h-2 w-40 bg-gray-300"
                    value={uploadProgress}
                  />
                </div>
              ) : isPending ? (
                <p>Redirecting please wait...</p>
              ) : isDrageOver ? (
                <p>
                  <span className="font-semibold">Drop file</span> to upload
                </p>
              ) : (
                <p>
                  <span className="font-semibold">
                    Click to {user.Resume ? "Update" : "upload"}
                  </span>{" "}
                  or drag & drop File: PDF
                </p>
              )}
            </div>
          </div>
        )}
      </Dropzone>

      <div className="mt-4">
        <Button
          onClick={handleContinue}
          disabled={(!user.Resume && !pdfFile) || isUploading}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default UploadResume;
