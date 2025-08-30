// server/actions/resumeData.ts
"use server";

import PdfParse from "pdf-parse";


export const resumeData = async (file: File) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await PdfParse(buffer);

    return data.text;
  } catch (error) {
    throw new Error("Failed to parse PDF");
  }
};
