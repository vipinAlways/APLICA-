import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createWriteStream, promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import { z } from "zod";
import os from "os";
import path from "path";
import { client } from "~/lib/Ai";
import { promptForSuggestions } from "~/lib/const";
import { auth } from "~/server/auth";
import { TRPCError } from "@trpc/server";
import type {
  PDFParserConstructor,
  PDFParserError,
  PDFParserInstance,
  ResumeImprovementResponse,
} from "~/type/types";
import type { Readable } from "stream";
import type { WriteStream } from "fs";

// ---- Type Definitions ----

// ---- Schemas ----

const ResumeSchema = z.object({
  polished_resume: z.string().min(1, "Polished resume cannot be empty"),
  mistakes_and_suggestions: z
    .array(z.string())
    .min(1, "Must have at least one suggestion"),
  skills_to_learn: z
    .array(z.string())
    .min(1, "Must have at least one skill to learn"),
});

const InputSchema = z.object({
  pdfUrl: z.string().url("Must be a valid URL"),
});

const OutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  rawText: z.string().optional(),
});

// ---- Utility Functions ----

async function streamPdfToFile(url: string, destPath: string): Promise<void> {
  try {
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
      try {
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
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        error instanceof Error ? error.message : "Failed to stream PDF file",
    });
  }
}

async function parsePdf(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      const PDFParserClass = PDFParser as unknown as PDFParserConstructor;
      const pdfParser: PDFParserInstance = new PDFParserClass(null, 1);

      pdfParser.on("pdfParser_dataError", (errData: PDFParserError) => {
        const errorMessage =
          errData?.parserError || errData?.message || "Failed to parse PDF";
        reject(
          new TRPCError({
            code: "BAD_REQUEST",
            message: errorMessage,
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
      .then((result: T) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      });
  });
}

async function cleanupFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // File might not exist or already deleted, log but don't throw
    console.warn(
      `Failed to cleanup file ${filePath}:`,
      error instanceof Error ? error.message : String(error),
    );
  }
}

function extractFallbackData(text: string): ResumeImprovementResponse | null {
  try {
    // Try to extract structured data even from malformed response
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let polished_resume = "";
    let mistakes_and_suggestions: string[] = [];
    let skills_to_learn: string[] = [];

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
      }

      // Skip JSON syntax lines
      if (
        line.includes("{") ||
        line.includes("}") ||
        line.includes("[") ||
        line.includes("]")
      ) {
        continue;
      }

      // Extract content based on current section
      const cleanLine = line.replace(/^["\-\*\•]\s*/, "").replace(/[",]$/, "");

      if (currentSection === "resume" && cleanLine.length > 20) {
        polished_resume += cleanLine + " ";
      } else if (currentSection === "mistakes" && cleanLine.length > 5) {
        mistakes_and_suggestions.push(cleanLine);
      } else if (currentSection === "skills" && cleanLine.length > 3) {
        skills_to_learn.push(cleanLine);
      }
    }

    // Validate extracted data
    if (
      polished_resume.length > 50 &&
      mistakes_and_suggestions.length > 0 &&
      skills_to_learn.length > 0
    ) {
      return {
        polished_resume: polished_resume.trim(),
        mistakes_and_suggestions,
        skills_to_learn,
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
    .input(InputSchema)
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

        const existingUser = await ctx.db.user.findFirst({
          where: { id: session.user.id },
          select: {
            id: true,
            SuggestedResume: true,
          },
        });

        if (!existingUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (existingUser.SuggestedResume) {
          return {
            success: true,
            message: "Resume already improved",
          };
        }

        // Stream PDF to temporary file
        await withTimeout(() => streamPdfToFile(pdfUrl, tempFilePath), 100_000);

        // Parse PDF text
        const parsedText = await withTimeout(
          () => parsePdf(tempFilePath),
          80_000,
        );

        if (!parsedText || parsedText.trim().length < 50) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "PDF contains insufficient text content",
          });
        }

        // Call AI for resume improvement
        const completion = await withTimeout(
          () =>
            client.chat.completions.create({
              model: "Meta-Llama-3.1-8B-Instruct",
              temperature: 0.7,
              max_tokens: 4000,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a professional resume improvement assistant. Respond ONLY with valid JSON matching the required schema. No markdown, no explanations, just JSON.",
                },
                {
                  role: "user",
                  content: `${promptForSuggestions}\n\nResume Text:\n${parsedText}\n\nReturn ONLY valid JSON with: polished_resume, mistakes_and_suggestions, skills_to_learn`,
                },
              ],
            }),
          45_000,
        );

        const rawOutput = completion.choices?.[0]?.message?.content?.trim();

        if (!rawOutput) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI service returned empty response",
          });
        }

        // Clean and parse AI response
        let aiResult: ResumeImprovementResponse;
        try {
          // Clean the JSON string to remove control characters and fix common issues
          let cleanedOutput = rawOutput
            // Remove control characters (0x00-0x1F except \t, \n, \r)
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
            // Fix escaped newlines and tabs in JSON strings
            .replace(/\\n/g, "\\n")
            .replace(/\\t/g, "\\t")
            .replace(/\\r/g, "\\r")
            // Remove any markdown code blocks if present
            .replace(/```json\s*/g, "")
            .replace(/```\s*/g, "")
            // Trim whitespace
            .trim();

          // Extract JSON if it's wrapped in other text
          const jsonStart = cleanedOutput.indexOf("{");
          const jsonEnd = cleanedOutput.lastIndexOf("}");

          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleanedOutput = cleanedOutput.substring(jsonStart, jsonEnd + 1);
          }

          console.log("Cleaned AI output:", cleanedOutput);

          const parsedJson = JSON.parse(cleanedOutput);
          aiResult = ResumeSchema.parse(parsedJson);
        } catch (parseError) {
          console.error("Invalid AI response:", rawOutput);
          console.error("Parse error:", parseError);

          // Try to extract meaningful information even if JSON parsing fails
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

        // Update user with AI suggestions
        await ctx.db.user.update({
          where: { id: session.user.id },
          data: {
            SuggestedResume: aiResult.polished_resume,
            suggestion: aiResult.skills_to_learn,
            improvement: aiResult.mistakes_and_suggestions,
          },
        });

        return {
          success: true,
          rawText: parsedText,
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
        // Always cleanup temp file
        await cleanupFile(tempFilePath);
      }
    }),

  // Additional procedure for direct file upload
  parseUploadedFile: publicProcedure
    .input(
      z.object({
        fileData: z.string().min(1, "File data is required"), // Base64 encoded
        fileName: z.string().optional(),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
        text: z.string().optional(),
        error: z.string().optional(),
        pages: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.pdf`);

      try {
        // Convert base64 to buffer and save to temp file
        const buffer = Buffer.from(input.fileData, "base64");
        await fs.writeFile(tempFilePath, buffer);

        // Parse PDF
        const text = await withTimeout(() => parsePdf(tempFilePath), 20_000);

        return {
          success: true,
          text,
        };
      } catch (error) {
        console.error("Error parsing uploaded PDF:", error);

        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to parse PDF",
        };
      } finally {
        await cleanupFile(tempFilePath);
      }
    }),
});

// ---- Type Exports for Client ----
export type PDFRouterInput = z.infer<typeof InputSchema>;
export type PDFRouterOutput = z.infer<typeof OutputSchema>;
