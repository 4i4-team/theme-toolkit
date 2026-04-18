/**
 * W3C Design Tokens Community Group (DTCG) format types.
 * Based on Second Editors' Draft (2024).
 */

// --- Primitive token value types ---

export type DTCGColorValue = string;

export type DTCGDimensionValue = string; // e.g. "16px", "1rem"

export type DTCGFontFamilyValue = string | string[];

export type DTCGFontWeightValue = number | string; // 400 or "bold"

export type DTCGDurationValue = string; // "200ms", "0.3s"

export type DTCGCubicBezierValue = [number, number, number, number];

export type DTCGNumberValue = number;

// --- Composite token value types ---

export type DTCGTypographyValue = {
  fontFamily: string | string[];
  fontSize: string;
  fontWeight: number | string;
  lineHeight: number | string;
  letterSpacing?: string;
};

export type DTCGShadowLayerValue = {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
  inset?: boolean;
};

export type DTCGShadowValue = DTCGShadowLayerValue | DTCGShadowLayerValue[];

export type DTCGBorderValue = {
  color: string;
  width: string;
  style: string;
};

export type DTCGTransitionValue = {
  duration: string;
  delay?: string;
  timingFunction: DTCGCubicBezierValue;
};

// --- Token types enum ---

export type DTCGTokenType =
  | "color"
  | "dimension"
  | "fontFamily"
  | "fontWeight"
  | "duration"
  | "cubicBezier"
  | "number"
  | "typography"
  | "shadow"
  | "border"
  | "transition"
  | "strokeStyle"
  | "gradient";

// --- Token node ---

export type DTCGToken = {
  $value: unknown;
  $type?: DTCGTokenType;
  $description?: string;
  $extensions?: Record<string, unknown>;
};

export type DTCGGroup = {
  $type?: DTCGTokenType;
  $description?: string;
  $extensions?: Record<string, unknown>;
  [key: string]: DTCGToken | DTCGGroup | DTCGTokenType | string | Record<string, unknown> | undefined;
};

export type DTCGDocument = DTCGGroup & {
  $name?: string;
};

// --- Resolved token (after reference resolution) ---

export type ResolvedDTCGToken = {
  path: string[];
  type: DTCGTokenType;
  value: unknown;
  description?: string;
  extensions?: Record<string, unknown>;
};
