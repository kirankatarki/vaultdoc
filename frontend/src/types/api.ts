export interface DetectResponse {
  format: "epub" | "docx" | "pdf";
  encrypted: boolean;
  filename: string;
}

export interface ApiError {
  detail: string;
}

export type TargetFormat = "epub" | "docx" | "pdf";
