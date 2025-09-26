import { PlanType } from "@prisma/client";
import { Princess_Sofia } from "next/font/google";

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
You are an expert in writing professional job application emails. 
Based on the given job role and the candidate's resume, generate a natural, persuasive, 
and human-like email that increases the chances of getting noticed by recruiters. With the proper format like mention subject and mail

Return the output strictly in this JSON format:
{
  "email": "A complete professional email tailored to the job role and user resume."
}

Rules:
- The email must read as if written by a human, not AI-generated.
- Avoid robotic or repetitive wording; keep it natural and conversational.
- Keep the tone professional, confident, and respectful.
- Optimize the structure: include greeting, introduction, relevant skills/experience, and a polite closing.
- The value for "email" must always be a single string.
`;
export const promptForProfessionCoverLetter = `
You are an expert in writing professional job application cover letter. 
Based on the given job role and the candidate's resume, generate a natural, persuasive, 
and human-like email that increases the chances of getting noticed by recruiters. With the proper format like mention subject and mail

Return the output strictly in this JSON format:
{
  "coverLetter": "A complete professional Cover Letter tailored to the job role and user resume."
}

Rules:
- The cover letter must read as if written by a human, not AI-generated.
- Avoid robotic or repetitive wording; keep it natural and conversational.
- Keep the tone professional, confident, and respectful.
- Optimize the structure: include greeting, introduction, relevant skills/experience, and a polite closing.
- The value for "coverLetter" must always be a single string.
`;

export const planFeatures = [
  {
    plan: PlanType.BASE,
    price: 0,
    features: [
      {
        maxCoverLetters: 10,
      },
      { maxEmails: 10 },
      { maxScores: 10 },
      { resumeUpload: 10 },
    ],
  },
  {
    plan: PlanType.PRO,
    price: 40,
    features: [
      {
        maxCoverLetters: 1000,
      },
      { maxEmails: 1000 },
      { maxScores: 1000 },
      { resumeUpload: 50 },
    ],
  },
  {
    plan: PlanType.ELITE,
    price: 100,
    features: [
      {
        maxCoverLetters: Infinity,
      },
      { maxEmails: Infinity },
      { maxScores: Infinity },
      { resumeUpload: Infinity },
      ,
    ],
  },
];
