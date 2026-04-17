import { createTheme } from "@4i4/theme-toolkit";

export const theme = createTheme(
  {
    breakpoints: { sm: 576, md: 768, lg: 1024, xl: 1280 },
    colors: {
      primary: {
        base: "#2251ff",
        text: "#ffffff",
        responsive: [
          { breakpoint: "sm", query: "max", base: "#1940b0" },
        ],
      },
      accent: {
        base: "#ff6600",
        text: "#1d1d1f",
        steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        baseStep: 500,
        lightenBy: 8,
        darkenBy: 12,
        responsive: [
          { breakpoint: "lg", query: "min", variant: "700" },
        ],
      },
      neutral: {
        base: "#6c757d",
        text: "#ffffff",
      },
      recipes: {
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
