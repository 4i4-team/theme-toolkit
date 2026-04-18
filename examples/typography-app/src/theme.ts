import { createTheme } from "@4i4/theme-toolkit";

export const rawTheme = {
  breakpoints: { sm: 576, md: 768, lg: 1024, xl: 1280 },
  typography: {
    fontFamily: {
      base: "Inter, sans-serif",
      variants: {
        heading: "Inter, sans-serif",
        mono: "IBM Plex Mono, monospace",
      },
    },
    fontSize: {
      base: 16,
      ratio: "major-third" as const,
    },
    fontWeight: {
      base: 400,
      variants: {
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    lineHeight: {
      base: 1.5,
      variants: {
        tight: 1.2,
        relaxed: 1.8,
      },
    },
    letterSpacing: {
      base: "0",
      variants: {
        tighter: "-0.02em",
        wide: "0.02em",
      },
    },
    fontStyle: {
      base: "normal",
      variants: { italic: "italic" },
    },
    textTransform: {
      base: "none",
      variants: { uppercase: "uppercase", capitalize: "capitalize", lowercase: "lowercase" },
    },
    textDecoration: {
      base: "none",
      variants: { underline: "underline", lineThrough: "line-through" },
    },
    textAlign: {
      base: "left",
      variants: { right: "right", center: "center", justify: "justify" },
    },
    recipes: {
      body: {
        sm: { fontFamily: "base", fontSize: "sm", fontWeight: "base", lineHeight: "relaxed", letterSpacing: "base" },
        md: { fontFamily: "base", fontSize: "md", fontWeight: "base", lineHeight: "base", letterSpacing: "base" },
      },
      heading: {
        lg: { fontFamily: "heading", fontSize: "lg", fontWeight: "semibold", lineHeight: "tight", letterSpacing: "tighter" },
        xl: {
          fontFamily: "heading", fontSize: "xl", fontWeight: "semibold", lineHeight: "tight", letterSpacing: "tighter",
          responsive: [
            { breakpoint: "lg", fontSize: "2xl", fontWeight: "bold" },
          ],
        },
        "2xl": {
          fontFamily: "heading", fontSize: "2xl", fontWeight: "bold", lineHeight: "tight", letterSpacing: "tighter",
          responsive: [
            { breakpoint: "lg", fontSize: "3xl" },
          ],
        },
      },
      code: {
        md: { fontFamily: "mono", fontSize: "sm", fontWeight: "base", lineHeight: "base", letterSpacing: "wide" },
      },
    },
  },
};

export const options = {
  typography: { unit: "rem" as const, prefix: "brand" },
};

export const theme = createTheme(rawTheme, options);
