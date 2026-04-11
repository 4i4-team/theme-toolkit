import "styled-components";
import type { ThemeAugmentation } from "@4i4/theme-toolkit";

declare module "styled-components" {
  interface DefaultTheme extends ThemeAugmentation {}
}