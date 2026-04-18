import { createTheme } from "@4i4/theme-toolkit";

export const rawTheme = {
  breakpoints: { sm: 576, md: 768, lg: 1024, xl: 1280 },
  colors: {
    primary: { base: "#4dabf7", text: "#fff", variants: { dark: "#1c7ed6" } },
    neutral: { base: "#868e96", text: "#fff", variants: { light: "#f1f3f5", dark: "#343a40" } },
    danger: { base: "#ff6b6b", text: "#fff" },
    recipes: {
      solid: {
        primary: { background: "primary", color: "primary.text" },
        danger: { background: "danger", color: "danger.text" },
        neutral: { background: "neutral.light", color: "neutral.dark" },
      },
    },
  },
  typography: {
    fontFamily: {
      base: "system-ui, -apple-system, sans-serif",
      variants: { heading: "Georgia, serif", mono: "'Fira Code', monospace" },
    },
    fontSize: { base: 16, variants: { sm: 14, lg: 20, xl: 24, "2xl": 32 } },
    fontWeight: { base: 400, variants: { medium: 500, bold: 700 } },
    lineHeight: { base: 1.5, variants: { tight: 1.2, loose: 1.8 } },
    recipes: {
      heading: {
        h1: { fontFamily: "heading", fontSize: "2xl", fontWeight: "bold", lineHeight: "tight" },
        h2: { fontFamily: "heading", fontSize: "xl", fontWeight: "bold", lineHeight: "tight" },
        h3: { fontFamily: "heading", fontSize: "lg", fontWeight: "medium" },
      },
      button: {
        large: { fontSize: "lg", fontWeight: "medium" },
        small: { fontSize: "sm", fontWeight: "medium" },
      },
    },
  },
  effects: {
    radius: { base: 4, variants: { none: 0, sm: 2, lg: 8, xl: 16, full: "9999px" } },
    shadow: {
      base: "0 1px 3px rgba(0,0,0,0.12)",
      variants: {
        none: "none",
        md: "0 4px 6px rgba(0,0,0,0.1)",
        lg: "0 10px 15px rgba(0,0,0,0.1)",
      },
    },
    transitions: {
      base: "all 150ms ease",
      variants: { fast: "all 100ms ease", slow: "all 300ms ease" },
    },
    recipes: {
      card: {
        default: { borderRadius: "base", boxShadow: "base", transition: "base" },
        elevated: { borderRadius: "lg", boxShadow: "lg" },
      },
    },
  },
  layout: {
    spacing: { base: 8, variants: { xs: 4, sm: 6, md: 12, lg: 16, xl: 24, "2xl": 32 } },
    recipes: {
      padding: {
        card: { paddingY: "lg", paddingX: "lg" },
        button: { paddingY: "sm", paddingX: "md" },
        "button-lg": { paddingY: "md", paddingX: "lg" },
      },
    },
  },
  components: {
    recipes: {
      buttons: {
        primary: {
          colors: "solid.primary",
          typography: "button.large",
          layout: "padding.button-lg",
          effects: "card.default",
          css: { cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" },
        },
        "primary-sm": {
          colors: "solid.primary",
          typography: "button.small",
          layout: "padding.button",
          effects: "card.default",
          css: { cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" },
        },
        danger: {
          colors: "solid.danger",
          typography: "button.large",
          layout: "padding.button-lg",
          effects: "card.default",
          css: { cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" },
        },
        ghost: {
          colors: "solid.neutral",
          typography: "button.small",
          layout: "padding.button",
          css: { cursor: "pointer", border: "none", background: "transparent" },
        },
      },
      cards: {
        default: {
          effects: "card.default",
          layout: "padding.card",
          css: { background: "#fff", overflow: "hidden" },
        },
        elevated: {
          effects: "card.elevated",
          layout: "padding.card",
          css: { background: "#fff", overflow: "hidden" },
        },
        hero: {
          colors: "solid.primary",
          effects: "card.elevated",
          layout: "padding.card",
          typography: "heading.h2",
        },
      },
    },
  },
};

export const options = {
  colors: { prefix: "brand", classPrefix: "brand-color" },
  typography: { prefix: "brand", classPrefix: "brand-type" },
  effects: { prefix: "brand", classPrefix: "brand-fx" },
  layout: { prefix: "brand", classPrefix: "brand-layout" },
  components: { prefix: "brand", classPrefix: "brand-comp" },
};

export const theme = createTheme(rawTheme, options);
