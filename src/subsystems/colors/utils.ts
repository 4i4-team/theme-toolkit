export type RGBTuple = readonly [number, number, number];

const HEX_LENGTHS = new Set([3, 6]);

export const convertHexToRGB = (hex: string): RGBTuple => {
  const sanitized = hex.replace(/^\s*#|\s*$/g, "");

  if (!HEX_LENGTHS.has(sanitized.length)) {
    throw new Error(`Unsupported hex length: "${sanitized}". Use 3 or 6 digits.`);
  }

  const normalized = sanitized.length === 3 ? sanitized.replace(/(.)/g, "$1$1") : sanitized;

  return [
    parseInt(normalized.substring(0, 2), 16),
    parseInt(normalized.substring(2, 4), 16),
    parseInt(normalized.substring(4, 6), 16),
  ] as RGBTuple;
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const clampChannel = (value: number): number => clamp(value, 0, 255);

export const convertRgbToHex = (rgb: RGBTuple): string => {
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
};

const clampPercent = (percent: number): number => clamp(percent, 0, 100);

export const lighten = (hex: string, percent: number): string => {
  const safePercent = clampPercent(percent);
  const [r, g, b] = convertHexToRGB(hex);

  const next = [
    Math.round(r + ((255 - r) * safePercent) / 100),
    Math.round(g + ((255 - g) * safePercent) / 100),
    Math.round(b + ((255 - b) * safePercent) / 100),
  ] as RGBTuple;

  return convertRgbToHex(next);
};

export const darken = (hex: string, percent: number): string => {
  const safePercent = clampPercent(percent);
  const [r, g, b] = convertHexToRGB(hex);

  const next = [
    Math.round(r - (r * safePercent) / 100),
    Math.round(g - (g * safePercent) / 100),
    Math.round(b - (b * safePercent) / 100),
  ] as RGBTuple;

  return convertRgbToHex(next);
};
