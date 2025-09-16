import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createWriteStream, promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import { z } from "zod";
import os from "os";
import path from "path";
import { client } from "~/lib/Ai";
import {
  promptForJobFit,
  promptForProfessionCoverLetter,
  promptForProfessionEmail,
  promptForSuggestions,
} from "~/lib/const";
import { auth } from "~/server/auth";
import { TRPCError } from "@trpc/server";
import type {
  PDFParserConstructor,
  PDFParserError,
  PDFParserInstance,
  promptForCoverLetterResponse,
  promptForEmailResponse,
  promptForJobFitResponse,
  ResumeImprovementResponse,
} from "~/type/types";
import type { WriteStream } from "fs";
import {
  OutputSchema,
  promptForCoverLetterSchema,
  promptForEmailSchema,
  promptForJobFitSchema,
  ResumeSchema,
} from "~/lib/scheama";
import { redirect } from "next/dist/server/api-utils";
import { extractFallbackData, parsePdf } from "~/utils/helper";

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

          const fallbackResult = extractFallbackData(
            rawOutput,
            "resume",
          ) as ResumeImprovementResponse;
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

      const completion = await client.chat.completions.create({
        model: "Meta-Llama-3.1-8B-Instruct",
        temperature: 0.2,
        max_tokens: 500,
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

        const fallbackResult = extractFallbackData(
          rawOutput,
          "jobfit",
        ) as promptForJobFitResponse;
        if (fallbackResult) {
          aiResult = fallbackResult;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI returned invalid response format. Please try again.",
          });
        }
      }

      return aiResult;
    }),

  createEmailAccToJob: publicProcedure
    .input(
      z.object({
        jobrole: z.string(),
        jobdescription: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { jobdescription, jobrole } = input;

      const session = await auth();

      if (!session) {
        new TRPCError({
          code: "NOT_FOUND",
          message: "user is not authenticate",
        });
      }

      const user = await ctx.db.user.findFirst({
        where: {
          id: session?.user.id,
        },
        select: {
          userResumeText: true,
        },
      });
      if (!user) {
        new TRPCError({
          code: "NOT_FOUND",
          message: "user is not authenticate in server",
        });
      }
      const completion = await client.chat.completions.create({
        model: "Meta-Llama-3.1-8B-Instruct",
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "You are a Job role Guide. Return only valid JSON with no additional text or markdown.",
          },
          {
            role: "user",
            content: `${promptForProfessionEmail}\n\nJob Title:\n${jobrole}\n\nJob Description:\n${jobdescription}\n\nResume:\n${user?.userResumeText ?? ""}`,
          },
        ],
      });

      const rawOutput = completion.choices?.[0]?.message?.content?.trim();
      if (!rawOutput) return null;

      let aiResult: promptForEmailResponse;
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
        aiResult = promptForEmailSchema.parse(parsedJson);
      } catch (parseError) {
        console.error("Invalid AI response:", rawOutput);
        console.error("Parse error:", parseError);

        const fallbackResult = extractFallbackData(
          rawOutput,
          "jobemail",
        ) as promptForEmailResponse;
        if (fallbackResult) {
          aiResult = fallbackResult;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI returned invalid response format. Please try again.",
          });
        }
      }

      return aiResult;
    }),
  createCoverLetter: publicProcedure
    .input(
      z.object({
        jobrole: z.string(),
        jobdescription: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { jobdescription, jobrole } = input;

      const session = await auth();

      if (!session) {
        new TRPCError({
          code: "NOT_FOUND",
          message: "user is not authenticate",
        });
      }

      const user = await ctx.db.user.findFirst({
        where: {
          id: session?.user.id,
        },
        select: {
          userResumeText: true,
        },
      });
      if (!user) {
        new TRPCError({
          code: "NOT_FOUND",
          message: "user is not authenticate in server",
        });
      }
      const completion = await client.chat.completions.create({
        model: "Meta-Llama-3.1-8B-Instruct",
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "You are a Job role Guide. Return only valid JSON with no additional text or markdown.",
          },
          {
            role: "user",
            content: `${promptForProfessionCoverLetter}\n\nJob Title:\n${jobrole}\n\nJob Description:\n${jobdescription}\n\nResume:\n${user?.userResumeText ?? ""}`,
          },
        ],
      });

      const rawOutput = completion.choices?.[0]?.message?.content?.trim();
      if (!rawOutput) return null;

      let aiResult: promptForCoverLetterResponse;
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
        aiResult = promptForCoverLetterSchema.parse(parsedJson);
      } catch (parseError) {
        console.error("Invalid AI response:", rawOutput);
        console.error("Parse error:", parseError);

        const fallbackResult = extractFallbackData(
          rawOutput,
          "coverletter",
        ) as promptForCoverLetterResponse;
        if (fallbackResult) {
          aiResult = fallbackResult;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI returned invalid response format. Please try again.",
          });
        }
      }

      return aiResult;
    }),
});

export type PDFRouterOutput = z.infer<typeof OutputSchema>;
