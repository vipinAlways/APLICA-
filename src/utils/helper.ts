import { TRPCError } from "@trpc/server";
import PDFParser from "pdf2json";
import type {
  PDFParserConstructor,
  PDFParserError,
  PDFParserInstance,
  promptForCoverLetterResponse,
  promptForEmailResponse,
  promptForJobFitResponse,
  ResumeImprovementResponse,
} from "~/type/types";

export async function parsePdf(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      const PDFParserClass = PDFParser as unknown as PDFParserConstructor;
      const pdfParser: PDFParserInstance = new PDFParserClass(null, 1);

      pdfParser.on("pdfParser_dataError", (errData: PDFParserError) => {
        reject(
          new TRPCError({
            code: "BAD_REQUEST",
            message:
              errData?.parserError ?? errData?.message ?? "Failed to parse PDF",
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

export function extractFallbackData(
  text: string,
  type: "resume" | "jobfit" | "jobemail" | "coverletter",
):
  | ResumeImprovementResponse
  | promptForJobFitResponse
  | promptForEmailResponse
  | promptForCoverLetterResponse
  | null {
  try {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (type === "resume") {
      // Original resume improvement logic
      let polished_resume = "";
      const mistakes_and_suggestions: string[] = [];
      const skills_to_learn: string[] = [];
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

        const cleanLine = line
          .replace(/^["\-\*\•]\s*/, "")
          .replace(/[",]$/, "");

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
    } else if (type === "jobfit") {
      let fit_score = 50;
      const improvements: string[] = [];
      let currentSection = "";

      for (const line of lines) {
        const lowerLine = line.toLowerCase();

        if (
          lowerLine.includes("fit") ||
          lowerLine.includes("score") ||
          lowerLine.includes("%")
        ) {
          const regex = /(\d+)%?/;
          const match = regex.exec(line);

          //TODO: regax methos
          if (match?.[1]) {
            fit_score = parseInt(match[1]);
          }
          continue;
        } else if (
          lowerLine.includes("improve") ||
          lowerLine.includes("enhance") ||
          lowerLine.includes("suggestion") ||
          lowerLine.includes("recommend")
        ) {
          currentSection = "improvements";
          continue;
        }

        const cleanLine = line
          .replace(/^["\-\*\•]\s*/, "")
          .replace(/[",]$/, "");

        if (currentSection === "improvements" && cleanLine.length > 5) {
          improvements.push(cleanLine);
        }
      }

      if (improvements.length > 0) {
        return {
          fit_score,
          improvements,
        };
      }
    } else if (type === "jobemail") {
      let email = "";

      for (const line of lines) {
        const cleanLine = line
          .replace(/^["\-\*\•]\s*/, "")
          .replace(/[",]$/, "");

        if (cleanLine.length > 5) {
          email += cleanLine + " ";
        }
      }

      if (email.length > 50) {
        return {
          email: email,
        };
      }
    } else if (type === "coverletter") {
      let coverLetter = "";

      for (const line of lines) {
        const cleanLine = line
          .replace(/^["\-\*\•]\s*/, "")
          .replace(/[",]$/, "");

        if (cleanLine.length > 5) {
          coverLetter += cleanLine + " ";
        }
      }

      if (coverLetter.length > 50) {
        return {
          coverLetter: coverLetter,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Fallback extraction failed:", error);
    return null;
  }
}
