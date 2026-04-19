import { createTheme, createCssAdapter } from "@4i4/theme-toolkit";
import { rawTheme, options } from "./rawTheme";

export const theme = createTheme(rawTheme, {
  ...options,
  adapter: createCssAdapter({ inline: true }),
});
