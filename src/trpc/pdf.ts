import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import { z } from "zod";
import os from "os";
import path from "path";

export const pdfRoute = createTRPCRouter({
  textextract: publicProcedure
    .input(
      z.object({
        fileBase64: z.string(),
      }),
    )
    //TODO:any type hatana hain 
    .mutation(async ({ input }) => {
      const { fileBase64 } = input;
      let fileName = "";
      let parsedText = "";

      fileName = uuidv4();
      const tempFilePath = path.join(os.tmpdir(), `${fileName}.pdf`);

      const fileBuffer = Buffer.from(fileBase64, "base64");

      await fs.writeFile(tempFilePath, fileBuffer);

      const pdfParser = new (PDFParser as any)(null, 1);

      const parsingPromise = new Promise<string>((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", (errData: any) => {
          console.error(errData.parserError);
          reject(errData.parserError);
        });

        pdfParser.on("pdfParser_dataReady", () => {
          parsedText = (pdfParser as any).getRawTextContent();
          resolve(parsedText);
        });
      });

      await pdfParser.loadPDF(tempFilePath);
      await parsingPromise;

      return { parsedText, fileName };
    }),
});
