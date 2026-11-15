export const FAST_ANALYSIS_MODEL = "gemini-3-flash-preview";
export const DEEP_ANALYSIS_MODEL = "gemini-3.1-pro-preview";
export type AnalysisMode = "fast" | "deep";

export function normalizeAnalysisMode(value: unknown): AnalysisMode {
  return value === "fast" ? "fast" : "deep";
}

export function modelForAnalysisMode(value: unknown): string {
  return normalizeAnalysisMode(value) === "fast" ? FAST_ANALYSIS_MODEL : DEEP_ANALYSIS_MODEL;
}
