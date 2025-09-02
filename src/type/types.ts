export interface ResumeImprovementResponse {
  polished_resume: string;
  mistakes_and_suggestions: string[];
  skills_to_learn: string[];
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