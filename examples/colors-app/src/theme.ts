import { DEFAULT_BREAKPOINTS, createTheme } from "@4i4/theme-toolkit";

const paletteSource = {
  primary: { base: "#2251ff", text: "#fff" },
  accent: { base: "#ff8a00", text: "#1d1d1f" },
} as const;

const typographySource = {
  families: {
    base: "Inter, sans-serif",
    heading: "Inter, sans-serif",
    mono: "IBM Plex Mono, monospace",
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
  letterSpacings: {
    tighter: "-0.02em",
    normal: "0",
    wide: "0.02em",
  },
  scale: {
    baseFontSize: 16,
    ratio: "major-third",
  },
  styles: {
    body: {
      md: {
        family: "base",
        size: "md",
        weight: "regular",
        lineHeight: "normal",
        letterSpacing: "normal",
      },
    },
    heading: {
      xl: {
        family: "heading",
        size: "xl",
        weight: "semibold",
        lineHeight: "tight",
        letterSpacing: "tighter",
      },
    },
  },
} as const;

const layoutSource = {
  spacing: {
    none: 0,
    default: 16,
    compact: 8,
    relaxed: {
      value: 32,
      responsive: [
        { breakpoint: "sm", value: 20 },
        { breakpoint: "lg", value: 40 },
      ],
    },
  },
  columns: 12,
  containers: {
    default: "layout",
    fluid: {
      mode: "fluid",
      maxWidth: { mode: "breakpoint", value: "xl" },
      inset: "relaxed",
    },
  },
  styles: {
    section: {
      hero: {
        marginY: "relaxed",
        paddingX: "relaxed",
      },
    },
    stack: {
      relaxed: {
        gap: "relaxed",
      },
    },
  },
} as const;

export const theme = createTheme(
  {
    breakpoints: DEFAULT_BREAKPOINTS,
    palette: paletteSource,
    typography: typographySource,
    layout: layoutSource,
  },
  {
    layout: { prefix: "--brand" },
    typography: { prefix: "--brand", unit: "rem" },
  },
);
