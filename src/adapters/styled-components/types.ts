import type { TypographyTokens } from "../../subsystems/typography";
import type { MediaHelpers } from "./media";
import type { PaletteTokens, PaletteRecipeStyleMap } from "../../subsystems/colors";
import type { LayoutTokens } from "../../subsystems/layout";
import type { CssNode, CssRuleNode, CssVariablesNode } from "../../core/common";

export interface ThemeAugmentation {
  media: MediaHelpers<string>;
  css: string;
  nodes: CssNode[];
  colors: Record<string, unknown> & {
    tokens: Record<string, PaletteTokens>;
    variables: CssVariablesNode[];
    nodes: CssNode[];
    classes: Record<string, Record<string, string>>;
    styles: Record<string, PaletteRecipeStyleMap<string>>;
    getClass: (group: string, variant: string) => string | undefined;
    lighten: (name: string, percent: number) => string;
    darken: (name: string, percent: number) => string;
    recipes: Record<string, unknown>;
  };
  typography: Record<string, unknown> & {
    tokens: TypographyTokens;
    variables: CssVariablesNode[];
    nodes: CssNode[];
    classes: Record<string, Record<string, string>>;
    getClass: (group: string, variant: string) => string | undefined;
    style: (group: string, variant: string) => Record<string, string>;
  };
  layout: Record<string, unknown> & {
    tokens: LayoutTokens;
    variables: CssVariablesNode[];
    nodes: CssNode[];
    classes: Record<string, Record<string, string>>;
    getClass: (group: string, variant: string) => string | undefined;
  };
}
