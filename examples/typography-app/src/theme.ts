import { createTheme } from "@4i4/theme-toolkit";

export const rawTheme = {
  breakpoints: { sm: 576, md: 768, lg: 1024, xl: 1280 },
  typography: {
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
      ratio: "major-third" as const,
    },
    recipes: {
      body: {
        sm: { family: "base", size: "sm", weight: "regular", lineHeight: "relaxed", letterSpacing: "normal" },
        md: { family: "base", size: "md", weight: "regular", lineHeight: "normal", letterSpacing: "normal" },
      },
      heading: {
        lg: { family: "heading", size: "lg", weight: "semibold", lineHeight: "tight", letterSpacing: "tighter" },
        xl: {
          family: "heading", size: "xl", weight: "semibold", lineHeight: "tight", letterSpacing: "tighter",
          responsive: [
            { breakpoint: "lg", size: "2xl", weight: "bold" },
          ],
        },
        "2xl": {
          family: "heading", size: "2xl", weight: "bold", lineHeight: "tight", letterSpacing: "tighter",
          responsive: [
            { breakpoint: "lg", size: "3xl" },
          ],
        },
      },
      code: {
        md: { family: "mono", size: "sm", weight: "regular", lineHeight: "normal", letterSpacing: "wide" },
      },
    },
  },
};

export const options = {
  typography: { unit: "rem" as const, prefix: "brand" },
};

export const theme = createTheme(rawTheme, options);
