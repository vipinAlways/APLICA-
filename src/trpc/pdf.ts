import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import { z } from "zod";
import os from "os";
import path from "path";
import { client } from "~/lib/Ai";
import { promptForSuggestions } from "~/lib/const";

export interface ErrData {
  parserError: string;
}

export const pdfRoute = createTRPCRouter({
  textextractAndImproveMent: publicProcedure
    .input(
      z.object({
        fileBase64: z.string().min(10, "File data is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const { fileBase64 } = input;
      const fileName = uuidv4();
      const tempFilePath = path.join(os.tmpdir(), `${fileName}.pdf`);

      try {
        // ✅ Save PDF temporarily
        const fileBuffer = Buffer.from(fileBase64, "base64");
        await fs.writeFile(tempFilePath, fileBuffer);

        // ✅ Parse PDF text
        const pdfParser = new (PDFParser as any)(null, 1);
        const parsedText: string = await new Promise((resolve, reject) => {
          pdfParser.on("pdfParser_dataError", (errData: ErrData) => {
            reject(new Error(errData.parserError));
          });
          pdfParser.on("pdfParser_dataReady", () => {
            resolve(pdfParser.getRawTextContent());
          });
          pdfParser.loadPDF(tempFilePath);
        });

        // ✅ Call AI model
        const completion = await client.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a helpful resume improvement assistant.",
            },
            {
              role: "user",
              content: `${promptForSuggestions}\n\nResume Text:\n${parsedText}`,
            },
          ],
          model: "Meta-Llama-3.1-8B-Instruct",
          temperature: 0.7,
        });

        const rawOutput =
          completion.choices?.[0]?.message?.content?.trim() ?? "{}";

        // ✅ Parse JSON safely
        let result;
        try {
          result = JSON.parse(rawOutput);
        } catch (err) {
          console.error("Invalid JSON from AI:", rawOutput);
          throw new Error("AI returned invalid JSON. Please retry.");
        }

        return {
          success: true,
          data: result,
          rawText: parsedText,
        };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || "Something went wrong",
        };
      } finally {
        // ✅ Always cleanup file
        await fs.unlink(tempFilePath).catch(() => {});
      }
    }),
});
