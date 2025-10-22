import { css } from "styled-components";
import { RuleSet } from "styled-components/dist/types";

type Colors = "main" | "dark" | "darker" | "light" | "lighter" | "text";
type ColorSet = Partial<Record<Colors, string>>;
export interface RequiredColorSet extends ColorSet {
  main: string;
  text: string;
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

export function buildPalettes<T extends string>(
  colorNames: Record<T, RequiredColorSet>,
): RuleSet<object> {
  return css`
    ${(Object.entries(colorNames) as Array<[T, RequiredColorSet]>).map(
      ([name, palette]) => css`
        --color--${name}: ${palette.main};
        --text--${name}: ${palette.text};
        --color--${name}--dark: ${palette.dark ?? darken(palette.main, 30)};
        --color--${name}--darker: ${palette.darker ?? darken(palette.main, 60)};
        --color--${name}--light: ${palette.light ?? lighten(palette.main, 30)};
        --color--${name}--lighter: ${palette.lighter ?? lighten(palette.main, 60)};
      `,
    )};
  `;
}

export function buildButtons<T extends string>(types: T[]): RuleSet<object> {
  return css`
    ${types.map(type => {
      return css`
        &.btn-${type} {
          background-color: var(--color--${type});
          color: var(--text--${type});

          &:hover {
            background-color: var(--color--${type}--dark);
          }

          &-hollow {
            border-color: var(--color--${type});
            background-color: #fff;
            color: var(--color--${type});

            &:hover {
              color: var(--text--${type});
              background-color: var(--color--${type}--dark);
            }
          }

          &-link {
            background-color: transparent;
            color: var(--color--${type});
            padding: 0 !important;

            &:hover {
              color: var(--color--${type}--dark);
              background-color: transparent;
            }
          }
        }
      `;
    })};
  `;
}
