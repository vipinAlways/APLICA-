export interface ResumeImprovementResponse {
  polished_resume: string;
  mistakes_and_suggestions: string[];
  skills_to_learn: string[];
  field:string
}


export interface PDFParserInstance {
  on(event: "pdfParser_dataError", listener: (errData: PDFParserError) => void): void;
  on(event: "pdfParser_dataReady", listener: () => void): void;
  getRawTextContent(): string;
  loadPDF(filePath: string): void;
}

export interface PDFParserError {
  parserError?: string;
  message?: string;
}

export interface PDFParserConstructor {
  new (context?: unknown, needRawText?: number): PDFParserInstance;
}

export interface JobCardProps {
  employer_name: string;
  employer_logo?: string;
  job_title: string;
  job_description: string;
  job_location: string;
  job_country: string;
  job_salary_min?: number | null;
  job_salary_max?: number | null;
  job_publisher: string;
  job_apply_link: string;
}
