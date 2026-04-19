import { createTheme, createCssAdapter } from "@4i4/theme-toolkit";
import { rawTheme, options } from "./rawTheme";

// Simulate two micro-frontends on the same page, each with its own scope
export const hostTheme = createTheme(rawTheme, {
  ...options,
  adapter: createCssAdapter({ scope: "host" }),
});

export const widgetTheme = createTheme(rawTheme, {
  ...options,
  adapter: createCssAdapter({ scope: "widget" }),
});
