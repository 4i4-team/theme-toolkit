import { createTheme, createCssAdapter } from "@4i4/theme-toolkit";

export const rawTheme = {
  breakpoints: { sm: 576, md: 768, lg: 1024 },
  colors: {
    primary: { base: "#4dabf7", text: "#fff", variants: { dark: "#1c7ed6" } },
    danger: { base: "#ff6b6b", text: "#fff" },
    success: { base: "#51cf66", text: "#fff" },
    neutral: { base: "#868e96", text: "#fff", variants: { light: "#f1f3f5", dark: "#343a40" } },
    recipes: {
      solid: {
        primary: { background: "primary", color: "primary.text" },
        danger: { background: "danger", color: "danger.text" },
        success: { background: "success", color: "success.text" },
      },
    },
  },
  typography: {
    fontFamily: { base: "system-ui, sans-serif", variants: { heading: "Georgia, serif" } },
    fontSize: { base: 16, variants: { sm: 14, lg: 20, xl: 24 } },
    fontWeight: { base: 400, variants: { medium: 500, bold: 700 } },
    lineHeight: { base: 1.5, variants: { tight: 1.2 } },
    recipes: {
      heading: {
        h2: { fontFamily: "heading", fontSize: "xl", fontWeight: "bold", lineHeight: "tight" },
      },
      button: {
        large: { fontSize: "lg", fontWeight: "medium" },
      },
    },
  },
  effects: {
    radius: { base: 6, variants: { lg: 12 } },
    shadow: { base: "0 1px 3px rgba(0,0,0,0.1)", variants: { lg: "0 10px 20px rgba(0,0,0,0.1)" } },
    transitions: { base: "all 150ms ease" },
    recipes: {
      card: {
        default: { borderRadius: "base", boxShadow: "base", transition: "base" },
        elevated: { borderRadius: "lg", boxShadow: "lg" },
      },
    },
  },
  layout: {
    spacing: { base: 8, variants: { sm: 4, md: 12, lg: 16, xl: 24 } },
    recipes: {
      padding: {
        card: { paddingY: "xl", paddingX: "xl" },
        button: { paddingY: "md", paddingX: "xl" },
      },
    },
  },
  components: {
    recipes: {
      buttons: {
        primary: {
          colors: "solid.primary",
          typography: "button.large",
          layout: "padding.button",
          effects: "card.default",
          css: { cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" },
        },
        danger: {
          colors: "solid.danger",
          typography: "button.large",
          layout: "padding.button",
          effects: "card.default",
          css: { cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" },
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
      },
    },
  },
};

const options = {
  colors: { prefix: "app", classPrefix: "app-color" },
  typography: { prefix: "app", classPrefix: "app-type" },
  effects: { prefix: "app", classPrefix: "app-fx" },
  layout: { prefix: "app", classPrefix: "app-layout" },
  components: { prefix: "app", classPrefix: "app" },
};

// --- Different adapters for different delivery styles ---

// 1. Default — var(--) references + global :root
export const defaultTheme = createTheme(rawTheme, options);

// 2. Inline — resolved values, no CSS variables
export const inlineTheme = createTheme(rawTheme, {
  ...options,
  adapter: createCssAdapter({ inline: true }),
});

// 3. Scoped — MFE-namespaced variables
export const scopedTheme = createTheme(rawTheme, {
  ...options,
  adapter: createCssAdapter({ scope: "widget" }),
});
