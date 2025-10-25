"use client";

import {
  File,
  Loader2,
  MousePointerSquareDashed,
  RocketIcon,
} from "lucide-react";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import Dropzone, { type FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { Progress } from "./ui/progress";
import { api } from "~/trpc/react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/app/api/uploadthing/core";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import Link from "next/link";
import { useSession } from "next-auth/react";

const { useUploadThing: useUT } = generateReactHelpers<OurFileRouter>();

const UploadResume = () => {
  const [isDrageOver, setisDrageOver] = useState(false);
  const [pdfFile, setPdfFile] = useState<File[] | null>();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const utils = api.useUtils();
  const router = useRouter();
  const [user] = api.user.existingUser.useSuspenseQuery();
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  const { data: session } = useSession();
  const { mutate, isPending } =
    api.pdfRoute.textextractAndImproveMent.useMutation({
      onSuccess: async () => {
        await utils.user.existingUser.invalidate();

        router.push("/find-job");
      },
      onError: (error) => {
        if (error?.data?.code === "TOO_MANY_REQUESTS") {
          setShowLimitAlert(true);
        } else {
          toast.error(error.message ?? "Something went wrong");
        }
      },
    });

  const { startUpload, isUploading } = useUT("pdfformUser", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        mutate({ pdfUrl: res[0].url });
      }
    },
    onUploadProgress: (progress) => setUploadProgress(progress),
    onUploadError: () => {
      toast.error("Something went wrong ");
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
    if (!user) {
      return toast.error("User Not Found ", {
        description: (
          <div>
            <p>Looks like your not authenticated</p>
            <Link href="/some-page" className="text-blue-400 underline">
              Sign In
            </Link>
          </div>
        ),
      });
    }
    if (!pdfFile && !user?.Resume) {
      return toast("Not able to find file", {
        description: "Please try again, thank you.",
      });
    }

    if (user?.Resume && !pdfFile) {
      router.push("/find-job");
      return;
    }

    if (pdfFile) {
      await startUpload(pdfFile);
    }
  }, [pdfFile, router, startUpload, user]);

  useEffect(() => {
    if (!pdfFile?.[0]) return;
    const url = URL.createObjectURL(pdfFile[0]);
    return () => URL.revokeObjectURL(url);
  }, [pdfFile]);

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 rounded-md p-6">
        <h1 className="text-2xl font-black">Ooops!</h1>
        <p className="text-center text-gray-700">
          Looks like you are not Signed In. Please do before giving it a try.
        </p>
        <Link
          href={"/api/auth/authentication"}
          className="w-28 rounded-md  bg-gray-200 p-2 text-center text-lg text-gray-800 "
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loader2 className="size-6 animate-spin" />}>
      <AlertDialog open={showLimitAlert} onOpenChange={setShowLimitAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              <span>
                You have reached your limit for this feature. Upgrade your plan
                to continue.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Link
              href={"/billing"}
              className="bg-muted flex gap-2 rounded-md p-1.5 text-black"
            >
              Upgrade <RocketIcon className="size-4" />{" "}
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="w-full">
        <div className="mb-4 flex w-full justify-center">
          <iframe
            src={
              pdfFile && pdfFile.length > 0
                ? URL.createObjectURL(pdfFile[0]!)
                : (user?.Resume ?? "")
            }
            className="h-72 w-4/5 rounded-md"
            loading="lazy"
          />
        </div>

        <Dropzone
          onDropRejected={onDropRejected}
          onDropAccepted={onDropAccepted}
          accept={{ "application/pdf": [".pdf"] }}
          onDragEnter={() => setisDrageOver(true)}
          onDragLeave={() => setisDrageOver(false)}
        >
          {({ getRootProps, getInputProps }) => (
            <div
              className="flex h-full w-full flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 p-6"
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
                      Click to {user?.Resume ? "Update" : "Upload"}
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
            disabled={(!user?.Resume && !pdfFile) || isUploading}
          >
            Continue {isPending && <Loader2 className="size-4 animate-spin" />}
          </Button>
        </div>
      </div>
    </Suspense>
  );
};

export default UploadResume;
