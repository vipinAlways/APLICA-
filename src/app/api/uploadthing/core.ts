import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Define your file routes
export const ourFileRouter = {
  pdfformUser: f({ pdf: { maxFileSize: "1MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("File uploaded to:", file.url);
    },
  ),
} satisfies FileRouter;

// ✅ Export the type for UploadButton component
export type OurFileRouter = typeof ourFileRouter;
