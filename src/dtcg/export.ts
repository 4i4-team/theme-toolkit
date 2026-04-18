import type { DTCGDocument, DTCGTokenType } from "./types";

type ThemeLike = {
  breakpoints?: Record<string, number>;
  colors?: { tokens?: Record<string, { base: string; text?: string; variants?: Record<string, string> }> };
  typography?: { tokens?: Record<string, { base: string | number; variants?: Record<string, string | number> }> };
  effects?: { tokens?: Record<string, { base: string | number; variants?: Record<string, string | number> }> };
  layout?: { tokens?: Record<string, { base: string | number; variants?: Record<string, string | number> }> };
};

export type ToDTCGOptions = {
  /** Name for the DTCG document. */
  name?: string;

  /** Whether to include breakpoints as dimension tokens. Default: true. */
  includeBreakpoints?: boolean;
};

/**
 * Convert a built theme's tokens into a DTCG-compliant JSON document.
 *
 * Returns a plain object — modify it freely before writing to a file.
 */
export const toDTCG = (theme: ThemeLike, options?: ToDTCGOptions): DTCGDocument => {
  const doc: DTCGDocument = {};

  if (options?.name) {
    doc.$name = options.name;
  }

  // Breakpoints
  if (theme.breakpoints && options?.includeBreakpoints !== false) {
    const bp: Record<string, unknown> = { $type: "dimension" as DTCGTokenType };
    for (const [name, value] of Object.entries(theme.breakpoints)) {
      bp[name] = { $value: `${value}px` };
    }
    doc.breakpoint = bp;
  }

  // Colors
  if (theme.colors?.tokens) {
    const colors: Record<string, unknown> = { $type: "color" as DTCGTokenType };
    for (const [name, token] of Object.entries(theme.colors.tokens)) {
      const group: Record<string, unknown> = {};
      group.base = { $value: token.base };
      if (token.text) {
        group.text = { $value: token.text };
      }
      if (token.variants) {
        for (const [variant, value] of Object.entries(token.variants)) {
          group[variant] = { $value: value };
        }
      }
      colors[name] = group;
    }
    doc.color = colors;
  }

  // Typography
  if (theme.typography?.tokens) {
    const typo: Record<string, unknown> = {};
    for (const [propName, token] of Object.entries(theme.typography.tokens)) {
      const type = getTypographyTokenType(propName);
      const group: Record<string, unknown> = { $type: type };
      group.base = { $value: formatTypoValue(propName, token.base) };
      if (token.variants) {
        for (const [variant, value] of Object.entries(token.variants)) {
          group[variant] = { $value: formatTypoValue(propName, value) };
        }
      }
      typo[propName] = group;
    }
    doc.typography = typo;
  }

  // Effects
  if (theme.effects?.tokens) {
    for (const [propName, token] of Object.entries(theme.effects.tokens)) {
      const { groupName, type } = getEffectsGroupInfo(propName);
      if (!doc[groupName]) {
        doc[groupName] = { $type: type };
      }
      const group = doc[groupName] as Record<string, unknown>;
      group.base = { $value: formatEffectsValue(propName, token.base) };
      if (token.variants) {
        for (const [variant, value] of Object.entries(token.variants)) {
          group[variant] = { $value: formatEffectsValue(propName, value) };
        }
      }
    }
  }

  // Layout (spacing)
  if (theme.layout?.tokens) {
    for (const [propName, token] of Object.entries(theme.layout.tokens)) {
      const groupName = propName === "aspectRatio" ? "aspectRatio" : propName;
      if (!doc[groupName]) {
        doc[groupName] = { $type: "dimension" as DTCGTokenType };
      }
      const group = doc[groupName] as Record<string, unknown>;
      group.base = { $value: formatDimensionValue(token.base) };
      if (token.variants) {
        for (const [variant, value] of Object.entries(token.variants)) {
          group[variant] = { $value: formatDimensionValue(value) };
        }
      }
    }
  }

  return doc;
};

// --- Helpers ---

const getTypographyTokenType = (propName: string): DTCGTokenType => {
  switch (propName) {
    case "fontFamily": return "fontFamily";
    case "fontWeight": return "fontWeight";
    case "fontSize":
    case "letterSpacing": return "dimension";
    default: return "number";
  }
};

const formatTypoValue = (propName: string, value: string | number): string | number => {
  if (propName === "fontSize" && typeof value === "number") {
    return `${value}px`;
  }
  return value;
};

const getEffectsGroupInfo = (propName: string): { groupName: string; type: DTCGTokenType } => {
  switch (propName) {
    case "shadow": return { groupName: "shadow", type: "shadow" };
    case "transitions": return { groupName: "transition", type: "transition" };
    case "radius":
    case "blur":
    case "borderWidth": return { groupName: propName, type: "dimension" };
    case "opacity":
    case "zIndex": return { groupName: propName, type: "number" };
    default: return { groupName: propName, type: "dimension" };
  }
};

const formatEffectsValue = (propName: string, value: string | number): string | number => {
  if ((propName === "radius" || propName === "blur" || propName === "borderWidth") && typeof value === "number") {
    return `${value}px`;
  }
  return value;
};

const formatDimensionValue = (value: string | number): string => {
  if (typeof value === "number") return `${value}px`;
  return String(value);
};
