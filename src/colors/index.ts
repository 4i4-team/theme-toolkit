type Colors = "main" | "dark" | "darker" | "light" | "lighter" | "text";
type ColorSet = Partial<Record<Colors, string>>;
export interface RequiredColorSet extends ColorSet {
  main: string;
  text: string;
}

export type PaletteVariantMap = Record<string, string>;

export interface PaletteSource {
  base: string;
  text: string;
  variants?: PaletteVariantMap;
  steps?: Array<string | number>;
  lightenBy?: number;
  darkenBy?: number;
  algorithm?: (base: string, step: string) => string;
}

export interface PaletteTokens {
  text: string;
  variants: PaletteVariantMap;
}

export interface PaletteBuilderOptions {
  prefix?: string;
}

export type RGBTuple = readonly [number, number, number];

const HEX_LENGTHS = new Set([3, 6]);

export function convertHexToRGB(hex: string): RGBTuple {
  const sanitized = hex.replace(/^\s*#|\s*$/g, "");

  if (!HEX_LENGTHS.has(sanitized.length)) {
    throw new Error(`Unsupported hex length: "${sanitized}". Use 3 or 6 digits.`);
  }

  const normalized =
    sanitized.length === 3 ? sanitized.replace(/(.)/g, "$1$1") : sanitized;

  return [
    parseInt(normalized.substring(0, 2), 16),
    parseInt(normalized.substring(2, 4), 16),
    parseInt(normalized.substring(4, 6), 16),
  ] as RGBTuple;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const clampChannel = (value: number): number => clamp(value, 0, 255);

export function convertRgbToHex(rgb: RGBTuple): string {
  if (rgb.length !== 3) {
    throw new Error(`Expected RGB tuple of length 3, received ${rgb.length}`);
  }

  const hex = rgb
    .map(value => {
      const next = clampChannel(value).toString(16);
      return next.length === 1 ? `0${next}` : next;
    })
    .join("");

  return `#${hex}`;
}

/** @deprecated Use palette token utilities instead. */
export function convertHexToHue(hex: string): number {
  const [r, g, b] = convertHexToRGB(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  if (max === min) {
    return 0;
  }

  let hue: number;

  if (max === r) {
    hue = (g - b) / (max - min);
  } else if (max === g) {
    hue = 2 + (b - r) / (max - min);
  } else {
    hue = 4 + (r - g) / (max - min);
  }

  hue *= 60;

  return hue < 0 ? hue + 360 : hue;
}

const clampPercent = (percent: number): number => clamp(percent, 0, 100);

export function lighten(hex: string, percent: number): string {
  const safePercent = clampPercent(percent);
  const [r, g, b] = convertHexToRGB(hex);

  const next = [
    Math.round(r + ((255 - r) * safePercent) / 100),
    Math.round(g + ((255 - g) * safePercent) / 100),
    Math.round(b + ((255 - b) * safePercent) / 100),
  ] as RGBTuple;

  return convertRgbToHex(next);
}

export function darken(hex: string, percent: number): string {
  const safePercent = clampPercent(percent);
  const [r, g, b] = convertHexToRGB(hex);

  const next = [
    Math.round(r - (r * safePercent) / 100),
    Math.round(g - (g * safePercent) / 100),
    Math.round(b - (b * safePercent) / 100),
  ] as RGBTuple;

  return convertRgbToHex(next);
}

export function buildPaletteTokens<T extends string>(
  paletteSource: Record<T, PaletteSource>,
  options?: PaletteBuilderOptions,
): {
  tokens: Record<T, PaletteTokens>;
  toCSS: () => string;
} {
  const prefix = normalizePrefix(options?.prefix);

  const tokens = (Object.entries(paletteSource) as Array<[T, PaletteSource]>).reduce(
    (accumulator, [name, palette]) => {
      accumulator[name] = buildPaletteTokenSet(palette);
      return accumulator;
    },
    {} as Record<T, PaletteTokens>,
  );

  return {
    tokens,
    toCSS: () => serializePaletteToCSS(tokens, prefix),
  };
}

/** @deprecated Use buildPaletteTokens instead. */
/** @deprecated Removed. Use buildPaletteTokens instead. */
export const buildPalettes = () => {
  throw new Error(
    "buildPalettes has been removed. Please migrate to buildPaletteTokens.",
  );
};
const DEFAULT_PREFIX = "--dt";

const normalizePrefix = (prefix?: string): string => {
  const normalized = prefix?.trim() || DEFAULT_PREFIX;
  return normalized.startsWith("--") ? normalized : `--${normalized}`;
};

const ensureVariantSteps = (
  palette: PaletteSource,
): string[] => {
  if (palette.steps && palette.steps.length) {
    return palette.steps.map(step => step.toString());
  }

  return ["light", "lighter", "dark", "darker"];
};

const buildPaletteTokenSet = (palette: PaletteSource): PaletteTokens => {
  const steps = ensureVariantSteps(palette);
  const variants: PaletteVariantMap = { main: palette.base, ...palette.variants };

  for (const step of steps) {
    if (variants[step]) {
      continue;
    }

    if (palette.algorithm) {
      variants[step] = palette.algorithm(palette.base, step);
      continue;
    }

    switch (step) {
      case "light":
        variants[step] = lighten(palette.base, palette.lightenBy ?? 30);
        break;
      case "lighter":
        variants[step] = lighten(palette.base, palette.lightenBy ?? 60);
        break;
      case "dark":
        variants[step] = darken(palette.base, palette.darkenBy ?? 30);
        break;
      case "darker":
        variants[step] = darken(palette.base, palette.darkenBy ?? 60);
        break;
      default:
        variants[step] = palette.lightenBy
          ? lighten(palette.base, palette.lightenBy)
          : darken(palette.base, palette.darkenBy ?? 30);
    }
  }

  return {
    text: palette.text,
    variants,
  };
};

const serializePaletteToCSS = (
  tokens: Record<string, PaletteTokens>,
  prefix: string,
): string => {
  const parts: string[] = [];

  for (const [name, palette] of Object.entries(tokens)) {
    parts.push(`${prefix}-color--${name}: ${palette.variants.main};`);
    parts.push(`${prefix}-text--${name}: ${palette.text};`);

    for (const [variant, value] of Object.entries(palette.variants)) {
      parts.push(`${prefix}-color--${name}--${variant}: ${value};`);
    }
  }

  return parts.join("\n");
};
