import { useEffect, useState } from "react";

export const ANALYSIS_MODE_KEY = "tax-return-saathi:analysis-mode";
export const ANALYSIS_MODE_EVENT = "tax-return-saathi:analysis-mode-changed";
export const FAST_ANALYSIS_MODE = "fast";
export const DEEP_ANALYSIS_MODE = "deep";

export function normalizeAnalysisMode(value) {
  return value === FAST_ANALYSIS_MODE ? FAST_ANALYSIS_MODE : DEEP_ANALYSIS_MODE;
}

export function readAnalysisMode() {
  try {
    return normalizeAnalysisMode(window.localStorage.getItem(ANALYSIS_MODE_KEY));
  } catch {
    return DEEP_ANALYSIS_MODE;
  }
}

export function writeAnalysisMode(value) {
  const mode = normalizeAnalysisMode(value);
  try {
    window.localStorage.setItem(ANALYSIS_MODE_KEY, mode);
  } catch {
    // The preference remains active for this component even if storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(ANALYSIS_MODE_EVENT, { detail: { mode } }));
  return mode;
}

export function useAnalysisModePreference() {
  const [mode, setMode] = useState(readAnalysisMode);
  useEffect(() => {
    const onChanged = (event) => setMode(normalizeAnalysisMode(event.detail?.mode));
    const onStorage = (event) => {
      if (event.key === ANALYSIS_MODE_KEY) setMode(normalizeAnalysisMode(event.newValue));
    };
    window.addEventListener(ANALYSIS_MODE_EVENT, onChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ANALYSIS_MODE_EVENT, onChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return [mode, (nextMode) => setMode(writeAnalysisMode(nextMode))];
}
