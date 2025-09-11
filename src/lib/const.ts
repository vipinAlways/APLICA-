import { api } from "~/trpc/react";

export const promptForSuggestions = `You are a resume improvement assistant. Analyze the resume and return JSON with these exact keys:

{
  "polished_resume": "Complete improved resume text - fix errors, improve clarity, add action verbs, make professional",
  "mistakes_and_suggestions": ["List 3-5 specific issues found", "Each as separate string"],
  "skills_to_learn": ["List 3-5 recommended skills", "Relevant to user's field"],
  "field": "Primary career field (e.g. Software Development)"
}

Rules: Return ONLY valid JSON. No markdown. No explanations.`;

export const promptForJobFit = `You are a job fit analyzer. Analyze the user's resume and the provided job description, then return JSON with these exact keys:

{
  "fit_score": 0, 
  "improvements": ["List 3-5 clear and actionable resume improvement tips to increase the chances of getting shortlisted"]
}

Rules:
- "fit_score" must be an integer between 0 and 100 that reflects how well the user's skills and experience align with the job description.
- "improvements" must be an array of strings. Each string should be one specific suggestion to strengthen the resume or profile.
- Do not include explanations, markdown, or extra text. Only output valid JSON with the above structure.
`;

export const promptForProfessionEmail = `
  You are ab Email expert of writting professional email as per the require role of applying, then return JSON with these exact keys:
  {
  "emial":"A fully impersevie email as per the job role and user resume."
  }

  Rules:
  -"email" must be looking like a human version so the ai which detects the ai email can not detect fully and must be the string and fully optimize 

`;
