import type { NormalizedPaletteValue } from "./types";

export const finalizePaletteNormalization = (
  name: string,
  normalized: NormalizedPaletteValue,
): NormalizedPaletteValue => {
  if (!normalized.text) {
    throw new Error(`Palette "${name}" is missing required "text" color.`);
  }

  return normalized;
};
