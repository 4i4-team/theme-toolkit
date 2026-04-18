import { createTheme } from "@4i4/theme-toolkit";

export const rawTheme = {
  breakpoints: { xs: 0, sm: 576, md: 768, lg: 1024, xl: 1280 },
  layout: {
    spacing: {
      base: 16,
      variants: {
        none: 0,
        compact: 8,
        relaxed: 32,
      },
      responsive: [
        { breakpoint: "sm", target: "relaxed", base: 20 },
        { breakpoint: "lg", target: "relaxed", base: 40 },
      ],
    },
    gutters: {
      base: 16,
      variants: { compact: 8, relaxed: 32, loose: 48 },
    },
    aspectRatio: {
      base: "auto",
      variants: { square: "1", video: "16/9", portrait: "3/4" },
    },
    container: {
      base: "fixed",
      inset: "base",
      gutter: "base",
      direction: "column" as const,
      variants: {
        narrow: { base: "fixed", maxWidth: "md" },
        wide: { base: "fluid", maxWidth: 1600, inset: "relaxed" },
        full: { base: "fluid" },
      },
    },
    columns: 12,
    grids: {
      cards: {
        templateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "relaxed",
      },
      feature: {
        templateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "base",
        responsive: [
          { breakpoint: "md", templateColumns: "repeat(2, minmax(0, 1fr))" },
          { breakpoint: "sm", templateColumns: "1fr" },
        ],
      },
    },
    stacks: {
      vertical: { direction: "column" as const, gap: "relaxed", align: "stretch" },
      horizontal: {
        direction: "row" as const, gap: "compact", align: "center",
        responsive: [{ breakpoint: "sm", direction: "column" as const }],
      },
      pills: { direction: "row" as const, inline: true, gap: "compact", wrap: "wrap" },
    },
    recipes: {
      section: {
        block: { paddingY: "compact", paddingX: "relaxed" },
        hero: { paddingY: "relaxed", paddingX: "relaxed" },
      },
    },
  },
};

export const options = {
  layout: { prefix: "brand", classPrefix: "brand" },
};

export const theme = createTheme(rawTheme, options);
