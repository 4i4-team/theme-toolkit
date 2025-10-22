import { css } from "styled-components";
import { RuleSet } from "styled-components/dist/types";

type Colors = "main" | "dark" | "darker" | "light" | "lighter" | "text";
type ColorSet = Partial<Record<Colors, string>>;
export interface RequiredColorSet extends ColorSet {
  main: string;
  text: string;
}

export function convertHexToRGB(hex: string): number[] {
  const sanitized = hex.replace(/^\s*#|\s*$/g, "");
  const normalized =
    sanitized.length === 3 ? sanitized.replace(/(.)/g, "$1$1") : sanitized;

  return [
    parseInt(normalized.substring(0, 2), 16),
    parseInt(normalized.substring(2, 4), 16),
    parseInt(normalized.substring(4, 6), 16),
  ];
}

export function convertRgbToHex(rgb: number[]): string {
  const hex = rgb
    .map(value => {
      const next = value.toString(16);
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

export function lighten(hex: string, percent: number): string {
  return convertRgbToHex(
    convertHexToRGB(hex).map(value =>
      Math.round(value + ((255 - value) * percent) / 100),
    ),
  );
}

export function darken(hex: string, percent: number): string {
  return convertRgbToHex(
    convertHexToRGB(hex).map(value => Math.round(value - (value * percent) / 100)),
  );
}

export function buildPalettes<T extends string>(
  colorNames: Record<T, RequiredColorSet>,
): RuleSet<object> {
  const keys = Object.keys(colorNames) as T[];

  return css`
    ${keys.map(key => {
      const palette = colorNames[key];

      return css`
        --color-${key}: ${palette.main};
        --text-${key}: ${palette.text};
        --color-${key}-dark: ${
          palette.dark ?? darken(palette.main, 30)
        };
        --color-${key}-darker: ${
          palette.darker ?? darken(palette.main, 60)
        };
        --color-${key}-light: ${
          palette.light ?? lighten(palette.main, 30)
        };
        --color-${key}-lighter: ${
          palette.lighter ?? lighten(palette.main, 60)
        };
      `;
    })};
  `;
}

export function buildButtons<T extends string>(types: T[]): RuleSet<object> {
  return css`
    ${types.map(type => {
      return css`
        &.btn-${type} {
          background-color: var(--color-${type});
          color: var(--text-${type});

          &:hover {
            background-color: var(--color-${type}-dark);
          }

          &-hollow {
            border-color: var(--color-${type});
            background-color: #fff;
            color: var(--color-${type});

            &:hover {
              color: var(--text-${type});
              background-color: var(--color-${type}-dark);
            }
          }

          &-link {
            background-color: transparent;
            color: var(--color-${type});
            padding: 0 !important;

            &:hover {
              color: var(--color-${type}-dark);
              background-color: transparent;
            }
          }
        }
      `;
    })};
  `;
}
