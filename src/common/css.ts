const DEFAULT_VARIABLE_PREFIX = "--dt";
const DEFAULT_CLASS_PREFIX = "dt";

export const sanitizeIdentifierSegment = (segment: string): string =>
  segment
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .toLowerCase();

export const normalizeCssVariablePrefix = (
  prefix?: string,
  fallback: string = DEFAULT_VARIABLE_PREFIX,
): string => {
  const trimmed = prefix?.trim() ?? "";
  const ensured = trimmed || fallback;
  const normalized = ensured.startsWith("--") ? ensured : `--${ensured.replace(/^--/, "")}`;
  return normalized || DEFAULT_VARIABLE_PREFIX;
};

export const normalizeCssClassPrefix = (
  classPrefix?: string,
  fallback: string = DEFAULT_CLASS_PREFIX,
): string => {
  const trimmed = classPrefix?.trim().replace(/^--/, "") ?? "";
  const sanitized = sanitizeIdentifierSegment(trimmed || fallback);
  return sanitized || DEFAULT_CLASS_PREFIX;
};
