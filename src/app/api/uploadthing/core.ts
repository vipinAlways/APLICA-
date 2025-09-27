import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();


export const ourFileRouter = {
  pdfformUser: f({ pdf: { maxFileSize: "1MB" } }).onUploadComplete(
    async () => {
      console.log("file uploaded");
    },
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
