import type {
  LayoutHelpers,
  LayoutTokens,
} from "../../subsystems/layout";
import type { TypographyTokens } from "../../subsystems/typography";
import type { MediaHelpers } from "../../subsystems/media";
import type { PaletteTokens, PaletteRecipeStyleMap } from "../../subsystems/colors";

export interface ThemeAugmentation {
  media: MediaHelpers<string>;
  colors: {
    source?: Record<string, unknown>;
    tokens: Record<string, PaletteTokens>;
    css: string;
    lighten: (name: string, percent: number) => string;
    darken: (name: string, percent: number) => string;
    recipes: {
      css: string;
      classes: Record<string, Record<string, string>>;
      styles: Record<string, PaletteRecipeStyleMap<string>>;
      getClass: (group: string, variant: string) => string | undefined;
    };
  };
  typography: {
    source?: Record<string, unknown>;
    tokens?: TypographyTokens;
    css: string;
    mixin: (group: string, variant: string) => ReturnType<typeof import("styled-components").css>;
  };
  layoutTokens?: LayoutTokens<string>;
  layoutCSS: string;
  layoutSpacing: LayoutHelpers<string>["spacing"];
  layoutGutter: LayoutHelpers<string>["gutter"];
  layoutColumns: LayoutHelpers<string>["buildColumns"];
  layoutContainer: LayoutHelpers<string>["buildContainer"];
  layoutStyle: LayoutHelpers<string>["layout"];
  layoutStack: LayoutHelpers<string>["stack"];
  layoutGrid: LayoutHelpers<string>["grid"];
  layoutClassPrefix: string;
  layoutColumnsMixin: () => ReturnType<typeof import("styled-components").css>;
  layoutContainerMixin: (name: string) => ReturnType<typeof import("styled-components").css>;
  layoutStyleMixin: (group: string, variant: string) => ReturnType<typeof import("styled-components").css>;
  layoutStackMixin: (name: string) => ReturnType<typeof import("styled-components").css>;
  layoutGridMixin: (name: string) => ReturnType<typeof import("styled-components").css>;
}
