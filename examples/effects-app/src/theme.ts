import { createTheme } from "@4i4/theme-toolkit";

export const rawTheme = {
  breakpoints: { sm: 576, md: 768, lg: 1024, xl: 1280 },
  effects: {
    radius: {
      base: 4,
      variants: { none: 0, sm: 2, lg: 8, xl: 16, full: "9999px" },
    },
    shadow: {
      base: "0 1px 3px rgba(0,0,0,0.12)",
      variants: {
        none: "none",
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 4px 6px rgba(0,0,0,0.1)",
        lg: "0 10px 15px rgba(0,0,0,0.1)",
        xl: "0 20px 25px rgba(0,0,0,0.15)",
      },
    },
    blur: {
      base: 0,
      variants: { sm: 4, md: 8, lg: 16, xl: 24 },
    },
    zIndex: {
      base: 0,
      variants: { dropdown: 1000, sticky: 1020, modal: 1100, tooltip: 1200, toast: 1300 },
    },
    opacity: {
      base: 1,
      variants: { disabled: 0.5, muted: 0.7, ghost: 0.3, hidden: 0 },
    },
    outline: {
      base: "2px solid currentColor",
      variants: { none: "none", ring: "2px solid #4dabf7", thick: "3px solid currentColor" },
    },
    borderWidth: {
      base: 1,
      variants: { none: 0, thick: 2, heavy: 4 },
    },
    transitions: {
      base: "all 150ms ease",
      variants: { fast: "all 100ms ease", slow: "all 300ms ease", none: "none" },
    },
    recipes: {
      card: {
        default: { borderRadius: "base", boxShadow: "base", transition: "base" },
        elevated: { borderRadius: "lg", boxShadow: "lg" },
        flat: { borderRadius: "sm", boxShadow: "none" },
      },
      focus: {
        ring: { outline: "ring" },
        thick: { outline: "thick" },
      },
      state: {
        disabled: { opacity: "disabled" },
        ghost: { opacity: "ghost", borderRadius: "lg" },
      },
    },
  },
};

export const options = {
  effects: { prefix: "brand", classPrefix: "brand-fx" },
};

export const theme = createTheme(rawTheme, options);
