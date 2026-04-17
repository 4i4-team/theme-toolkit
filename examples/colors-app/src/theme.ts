import { createTheme } from "@4i4/theme-toolkit";

export const theme = createTheme(
  {
    breakpoints: { sm: 576, md: 768, lg: 1024, xl: 1280 },
    colors: {
      primary: {
        base: "#2251ff",
        text: "#ffffff",
        variants: {
          dark: { base: "#1a3fcc" },
        },
        responsive: [
          { breakpoint: "sm", query: "max", base: "#1940b0" },
        ],
      },
      accent: {
        base: "#ff8a00",
        text: "#1d1d1f",
      },
      neutral: {
        base: "#1f2533",
        text: "#ffffff",
      },
      recipes: {
        surfaces: {
          subtle: {
            background: "neutral.light",
            color: "neutral.text",
          },
          brand: {
            background: "primary",
            color: "primary.text",
          },
          contrast: {
            background: "neutral.darker",
            color: "neutral.text",
          },
        },
        buttons: {
          solid: {
            background: "primary",
            color: "primary.text",
          },
          outline: {
            background: "transparent",
            color: "primary",
            "border-color": "primary",
            responsive: [
              { breakpoint: "md", query: "min", color: "accent", "border-color": "accent" },
            ],
          },
          accent: {
            background: "accent",
            color: "accent.text",
          },
        },
      },
    },
  },
  {
    palette: { prefix: "brand", classPrefix: "brand-color" },
  },
);
