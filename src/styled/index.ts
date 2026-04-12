import type {
  LayoutHelpers,
  LayoutTokens,
} from "../layout";
import type { TypographyTokens } from "../typography";
import type { MediaHelpers } from "../media";
import type { PaletteTokens } from "../colors";

export interface ThemeAugmentation {
  media: MediaHelpers<string>;
  paletteTokens: Record<string, PaletteTokens>;
  paletteCSS: string;
  lightenColor: (name: string, percent: number) => string;
  darkenColor: (name: string, percent: number) => string;
  typographyTokens?: TypographyTokens;
  typographyCSS: string;
  typographyMixin: (group: string, variant: string) => ReturnType<typeof import("../typography").typographyMixin>;
  layoutTokens?: LayoutTokens<string>;
  layoutCSS: string;
  layoutSpacing: LayoutHelpers<string>["spacing"];
  layoutGutter: LayoutHelpers<string>["gutter"];
  layoutColumns: LayoutHelpers<string>["buildColumns"];
  layoutContainer: LayoutHelpers<string>["buildContainer"];
  layoutStyle: LayoutHelpers<string>["layout"];
  layoutStack: LayoutHelpers<string>["stack"];
  layoutGrid: LayoutHelpers<string>["grid"];
  layoutColumnsMixin: () => ReturnType<typeof import("styled-components").css>;
  layoutContainerMixin: (name: string) => ReturnType<typeof import("styled-components").css>;
  layoutStyleMixin: (group: string, variant: string) => ReturnType<typeof import("styled-components").css>;
  layoutStackMixin: (name: string) => ReturnType<typeof import("styled-components").css>;
  layoutGridMixin: (name: string) => ReturnType<typeof import("styled-components").css>;
}
