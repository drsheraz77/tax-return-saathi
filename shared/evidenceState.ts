export type EvidenceStatus =
  | "KNOWN"
  | "KNOWN_ZERO"
  | "UNKNOWN"
  | "NOT_FOUND"
  | "NOT_APPLICABLE";

export type EvidenceConfidence = "high" | "medium" | "low";

export type EvidenceValue = {
  value: number | null;
  status: EvidenceStatus;
  sourceRef?: string;
  confidence?: EvidenceConfidence;
};

export type EvidenceSummary = {
  fields: Record<string, EvidenceValue>;
  knownFields: string[];
  unknownFields: string[];
  boundary: string;
};

export type LegacyEvidenceOptions = {
  explicitlyKnownZero?: boolean;
  status?: EvidenceStatus;
  sourceRef?: string;
  confidence?: EvidenceConfidence;
};

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Adapt a legacy numeric field without treating an implicit zero as established.
 * Existing engines can continue consuming their numeric inputs separately.
 */
export function normalizeLegacyNumericEvidence(value: unknown, options: LegacyEvidenceOptions = {}): EvidenceValue {
  const numeric = finiteNumber(value);
  const status = options.status
    ?? (numeric === null ? "UNKNOWN" : numeric === 0 && !options.explicitlyKnownZero ? "UNKNOWN" : numeric === 0 ? "KNOWN_ZERO" : "KNOWN");

  return {
    value: numeric,
    status,
    ...(options.sourceRef ? { sourceRef: options.sourceRef } : {}),
    ...(options.confidence ? { confidence: options.confidence } : {}),
  };
}

export function buildLegacyEvidenceSummary(input: Record<string, unknown>): EvidenceSummary {
  const fields: Record<string, EvidenceValue> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "number" || value === null || value === undefined) {
      fields[key] = normalizeLegacyNumericEvidence(value);
    }
  }

  const knownFields = Object.entries(fields).filter(([, item]) => item.status === "KNOWN" || item.status === "KNOWN_ZERO").map(([key]) => key);
  const unknownFields = Object.entries(fields).filter(([, item]) => item.status === "UNKNOWN" || item.status === "NOT_FOUND").map(([key]) => key);

  return {
    fields,
    knownFields,
    unknownFields,
    boundary: "Legacy numeric extraction fields remain available to deterministic engines; an implicit zero is not treated as evidence of a known zero.",
  };
}
