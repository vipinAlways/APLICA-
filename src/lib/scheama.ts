import z from "zod";

export const ResumeSchema = z.object({
  polished_resume: z.string().min(1, "Polished resume cannot be empty"),
  mistakes_and_suggestions: z
    .array(z.string())
    .min(1, "Must have at least one suggestion"),
  skills_to_learn: z
    .array(z.string())
    .min(1, "Must have at least one skill to learn"),
  field: z.string().min(1, "Field cannot be empty"),
});
export const OutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  rawText: z.string().optional(),
});