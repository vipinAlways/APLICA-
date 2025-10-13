import { PlanType } from "@prisma/client";
import type { PlanFeatures } from "~/type/types";

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

export const planFeatures: PlanFeatures[] = [
  {
    plan: PlanType.BASE,
    price: "0",
    features: {
      numberOfCoverLetter: 10,
      numberOfEmail: 10,
      numberOfScore: 10,
      resumeUpload: 10,
    },
  },
  {
    plan: PlanType.PRO,
    price: "40",
    features: {
      numberOfCoverLetter: 1000,
      numberOfEmail: 1000,
      numberOfScore: 1000,
      resumeUpload: 1000,
    },
  },
  {
    plan: PlanType.ELITE,
    price: "100",
    features: {
      numberOfCoverLetter: Infinity,
      numberOfEmail: Infinity,
      numberOfScore: Infinity,
      resumeUpload: Infinity,
    },
  },
];

export const Features = [
  {
    icons: "/howwork/a1",
    featureName: "dss",
    description: "",
  },
];

export const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    testimonial:
      "Aplica has transformed my job search! The AI suggestions for resumes, cover letters, and emails helped me land interviews faster and stand out to employers.",
  },
  {
    name: "Rohan Verma",
    role: "Marketing Specialist",
    testimonial:
      "Thanks to Aplica, my resume is now ATS-friendly, and the email templates saved me so much time. Applying for jobs has never been easier.",
  },
  {
    name: "Anita Das",
    role: "UI/UX Designer",
    testimonial:
      "I loved how Aplica guided me in improving my resume and cover letter. The AI tips are really practical and made my applications look professional.",
  },
  {
    name: "Vikram Singh",
    role: "Data Analyst",
    testimonial:
      "The AI-powered job search and resume optimization features in Aplica gave me an edge. I felt confident submitting applications knowing they were ATS-ready.",
  },
  {
    name: "Neha Kapoor",
    role: "Project Manager",
    testimonial:
      "Aplica made the job hunt less stressful. From drafting personalized emails to improving my CV, the app does it all and saves so much time.",
  },
  {
    name: "Arjun Mehta",
    role: "Frontend Developer",
    testimonial:
      "This app is a lifesaver! The AI suggestions for cover letters and resume tips are spot-on. I finally feel my applications truly reflect my skills.",
  },
];
