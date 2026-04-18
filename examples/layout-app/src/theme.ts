import { createTheme } from "@4i4/theme-toolkit";

export const rawTheme = {
  breakpoints: { xs: 0, sm: 576, md: 768, lg: 1024, xl: 1280 },
  colors: {
    primary: { base: "#2251ff", text: "#fff" },
    accent: { base: "#ff8a00", text: "#1d1d1f" },
  },
  typography: {
    fontFamily: { base: "Inter, sans-serif", variants: { heading: "Inter, sans-serif", mono: "IBM Plex Mono, monospace" } },
    fontSize: { base: 16, ratio: "major-third" as const },
    fontWeight: { base: 400, variants: { medium: 500, semibold: 600, bold: 700 } },
    lineHeight: { base: 1.5, variants: { tight: 1.2, relaxed: 1.8 } },
    letterSpacing: { base: "0", variants: { tighter: "-0.02em", wide: "0.02em" } },
  },
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
    columns: 12,
    containers: {
      default: "layout" as const,
      narrow: {
        mode: "fixed" as const,
        clampTo: { breakpoint: "md" as const },
      },
      wide: {
        mode: "fluid" as const,
        maxWidth: { mode: "custom" as const, value: "1600px" },
        inset: "relaxed",
      },
    },
    recipes: {
      section: {
        block: { paddingY: "compact", paddingX: "relaxed" },
        hero: { paddingY: "compact" },
      },
    },
    stacks: {
      vertical: { direction: "column" as const, gap: "relaxed", align: "stretch" },
      horizontal: {
        direction: "row" as const, gap: "compact", align: "center",
        responsive: [{ breakpoint: "sm", direction: "column" as const }],
      },
      inlinePills: { direction: "row" as const, inline: true, gap: "compact", wrap: "wrap" },
    },
    grids: {
      cards: { templateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "relaxed" },
      feature: {
        templateColumns: "repeat(3, minmax(0, 1fr))", gap: "default",
        responsive: [
          { breakpoint: "md", templateColumns: "repeat(2, minmax(0, 1fr))" },
          { breakpoint: "sm", templateColumns: "repeat(1, minmax(0, 1fr))" },
        ],
      },
    },
  },
};

export const options = {
  palette: { prefix: "brand" },
  typography: { prefix: "brand", unit: "rem" as const },
  layout: { prefix: "brand" },
};

export const theme = createTheme(rawTheme, options);
