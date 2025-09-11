import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createWriteStream, promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import { z } from "zod";
import os from "os";
import path from "path";
import { client } from "~/lib/Ai";
import { promptForJobFit, promptForSuggestions } from "~/lib/const";
import { auth } from "~/server/auth";
import { TRPCError } from "@trpc/server";
import type {
  PDFParserConstructor,
  PDFParserError,
  PDFParserInstance,
  promptForJobFitResponse,
  ResumeImprovementResponse,
} from "~/type/types";
import type { WriteStream } from "fs";
import {
  OutputSchema,
  promptForJobFitSchema,
  ResumeSchema,
} from "~/lib/scheama";
import { retryLink } from "@trpc/client";

async function streamPdfToFile(url: string, destPath: string): Promise<void> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Failed to fetch PDF. Status: ${response.status}`,
    });
  }

  if (!response.body) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No response body received",
    });
  }

  const fileStream: WriteStream = createWriteStream(destPath);

  await new Promise<void>((resolve, reject) => {
    const reader = response.body!.getReader();

    const pump = async (): Promise<void> => {
      try {
        const { done, value } = await reader.read();

        if (done) {
          fileStream.end();
          resolve();
          return;
        }

        const chunk = Buffer.from(value);
        if (!fileStream.write(chunk)) {
          await new Promise<void>((resolveWrite) => {
            fileStream.once("drain", resolveWrite);
          });
        }

        await pump();
      } catch (error) {
        fileStream.destroy();
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };

    fileStream.on("error", reject);
    pump();
  });
}

async function parsePdf(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      const PDFParserClass = PDFParser as unknown as PDFParserConstructor;
      const pdfParser: PDFParserInstance = new PDFParserClass(null, 1);

      pdfParser.on("pdfParser_dataError", (errData: PDFParserError) => {
        reject(
          new TRPCError({
            code: "BAD_REQUEST",
            message:
              errData?.parserError || errData?.message || "Failed to parse PDF",
          }),
        );
      });

      pdfParser.on("pdfParser_dataReady", () => {
        try {
          const text = pdfParser.getRawTextContent();
          if (!text || text.trim().length === 0) {
            reject(
              new TRPCError({
                code: "BAD_REQUEST",
                message:
                  "PDF appears to be empty or contains no extractable text",
              }),
            );
            return;
          }
          resolve(text);
        } catch (error) {
          reject(
            new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to extract text from PDF",
            }),
          );
        }
      });

      pdfParser.loadPDF(filePath);
    } catch (error) {
      reject(
        new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to initialize PDF parser",
        }),
      );
    }
  });
}

async function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new TRPCError({
          code: "TIMEOUT",
          message: `Operation timed out after ${ms}ms`,
        }),
      );
    }, ms);

    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      });
  });
}

async function cleanupFile(filePath: string): Promise<void> {
  await fs.unlink(filePath);
}

function extractFallbackData(text: string): ResumeImprovementResponse | null {
  try {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let polished_resume = "";
    let mistakes_and_suggestions: string[] = [];
    let skills_to_learn: string[] = [];
    let field = "";

    let currentSection = "";

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (lowerLine.includes("polished") || lowerLine.includes("improved")) {
        currentSection = "resume";
        continue;
      } else if (
        lowerLine.includes("mistake") ||
        lowerLine.includes("suggestion")
      ) {
        currentSection = "mistakes";
        continue;
      } else if (lowerLine.includes("skill") || lowerLine.includes("learn")) {
        currentSection = "skills";
        continue;
      } else if (lowerLine.includes("field") || lowerLine.includes("role")) {
        currentSection = "field";
        continue;
      }

      const cleanLine = line.replace(/^["\-\*\•]\s*/, "").replace(/[",]$/, "");

      if (currentSection === "resume" && cleanLine.length > 20) {
        polished_resume += cleanLine + " ";
      } else if (currentSection === "mistakes" && cleanLine.length > 5) {
        mistakes_and_suggestions.push(cleanLine);
      } else if (currentSection === "skills" && cleanLine.length > 3) {
        skills_to_learn.push(cleanLine);
      } else if (currentSection === "field" && cleanLine.length > 2) {
        field = cleanLine;
      }
    }

    if (
      polished_resume.length > 50 &&
      mistakes_and_suggestions.length > 0 &&
      skills_to_learn.length > 0
    ) {
      return {
        polished_resume: polished_resume.trim(),
        mistakes_and_suggestions,
        skills_to_learn,
        field: field || "General",
      };
    }

    return null;
  } catch (error) {
    console.error("Fallback extraction failed:", error);
    return null;
  }
}

// ---- Main Router ----
export const pdfRoute = createTRPCRouter({
  textextractAndImproveMent: publicProcedure
    .input(
      z.object({
        pdfUrl: z.string().url("Must be a valid URL"),
      }),
    )
    .output(OutputSchema)
    .mutation(async ({ ctx, input }): Promise<z.infer<typeof OutputSchema>> => {
      const { pdfUrl } = input;
      const fileName = uuidv4();
      const tempFilePath = path.join(os.tmpdir(), `${fileName}.pdf`);

      try {
        const session = await auth();

        if (!session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated",
          });
        }

        if (!input.pdfUrl) {
          return {
            success: true,
            message: "Resume already improved",
          };
        }

        await withTimeout(() => streamPdfToFile(pdfUrl, tempFilePath), 20_000); // 20s

        const parsedText = await withTimeout(
          () => parsePdf(tempFilePath),
          15_000,
        );

        if (!parsedText || parsedText.trim().length < 50) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "PDF contains insufficient text content",
          });
        }

        const completion = await client.chat.completions.create({
          model: "Meta-Llama-3.1-8B-Instruct",
          temperature: 0.2,
          max_tokens: 2000,
          messages: [
            {
              role: "system",
              content:
                "You are a resume improvement assistant. Return only valid JSON with no additional text or markdown.",
            },
            {
              role: "user",
              content: `${promptForSuggestions}\n\nResume:\n${parsedText.substring(0, 4000)}`, // Truncate input
            },
          ],
        });

        const rawOutput = completion.choices?.[0]?.message?.content?.trim();

        if (!rawOutput) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI service returned empty response",
          });
        }

        let aiResult: ResumeImprovementResponse;
        try {
          let cleanedOutput = rawOutput
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
            .replace(/\\n/g, "\\n")
            .replace(/\\t/g, "\\t")
            .replace(/\\r/g, "\\r")
            .replace(/```json\s*/g, "")
            .replace(/```\s*/g, "")
            .trim();

          const jsonStart = cleanedOutput.indexOf("{");
          const jsonEnd = cleanedOutput.lastIndexOf("}");

          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleanedOutput = cleanedOutput.substring(jsonStart, jsonEnd + 1);
          }

          const parsedJson = JSON.parse(cleanedOutput);
          aiResult = ResumeSchema.parse(parsedJson);
        } catch (parseError) {
          console.error("Invalid AI response:", rawOutput);
          console.error("Parse error:", parseError);

          const fallbackResult = extractFallbackData(rawOutput);
          if (fallbackResult) {
            aiResult = fallbackResult;
          } else {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "AI returned invalid response format. Please try again.",
            });
          }
        }

        await ctx.db.user.update({
          where: { id: session.user.id },
          data: {
            SuggestedResume: aiResult.polished_resume,
            suggestion: aiResult.skills_to_learn,
            improvement: aiResult.mistakes_and_suggestions,
            field: aiResult.field || "General",
            Resume: input.pdfUrl,
            userResumeText: parsedText,
          },
        });

        return {
          success: true,
          message: "Resume successfully analyzed and improved",
        };
      } catch (error) {
        console.error("Error in textextractAndImproveMent:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        });
      } finally {
        await cleanupFile(tempFilePath);
      }
    }),

  AccordingToJob: publicProcedure
    .input(
      z.object({
        jobTitle: z.string(),
        jobDescription: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { jobTitle, jobDescription } = input;

      const session = await auth();

      if (!session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be authenticated",
        });
      }

      const user = await ctx.db.user.findFirst({
        where: {
          id: session.user.id,
        },
        select: {
          userResumeText: true,

        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "user not found",
        });
      }

      if (!user.userResumeText) {
        return null;
      }

      // const fileName = uuidv4();
      // const tempFilePath = path.join(os.tmpdir(), `${fileName}.pdf`);

      // const resumeUrl = user.Resume;
      // await withTimeout(() => streamPdfToFile(resumeUrl, tempFilePath), 20_000);

      // const parsedText = await withTimeout(
      //   () => parsePdf(tempFilePath),
      //   15_000,
      // );
      const completion = await client.chat.completions.create({
        model: "Meta-Llama-3.1-8B-Instruct",
        temperature: 0.2,
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content:
              "You are a Job role Guide. Return only valid JSON with no additional text or markdown.",
          },
          {
            role: "user",
            content: `${promptForJobFit}\n\nJob Title:\n${jobTitle}\n\nJob Description:\n${jobDescription}\n\nResume:\n${user.userResumeText}`,
          },
        ],
      });

      const rawOutput = completion.choices?.[0]?.message?.content?.trim();
      if (!rawOutput) return null;

      let aiResult: promptForJobFitResponse;
      try {
        let cleanedOutput = rawOutput
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
          .replace(/\\n/g, "\\n")
          .replace(/\\t/g, "\\t")
          .replace(/\\r/g, "\\r")
          .replace(/```json\s*/g, "")
          .replace(/```\s*/g, "")
          .trim();

        const jsonStart = cleanedOutput.indexOf("{");
        const jsonEnd = cleanedOutput.lastIndexOf("}");

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          cleanedOutput = cleanedOutput.substring(jsonStart, jsonEnd + 1);
        }

        const parsedJson = JSON.parse(cleanedOutput);
        aiResult = promptForJobFitSchema.parse(parsedJson);
      } catch (parseError) {
        console.error("Invalid AI response:", rawOutput);
        console.error("Parse error:", parseError);

        const fallbackResult = extractFallbackData(rawOutput);
        if (fallbackResult) {
          //TODO:see this one 
          aiResult = fallbackResult;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI returned invalid response format. Please try again.",
          });
        }
      }
    }),

  createEmailAccToJob: publicProcedure
    .input(
      z.object({
        jobrole: z.string(),
        jobdescription: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { jobdescription, jobrole } = input;
    }),
});

export type PDFRouterOutput = z.infer<typeof OutputSchema>;
