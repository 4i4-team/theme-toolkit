import type { MediaHelpers } from "../../../subsystems/media";
import type { RecipeResponsiveOverride } from "../types";

export type RecipeStyleBlock = Record<string, string | number>;

export type InterpretedRecipeVariant<TBreakpoint extends string> = {
  base: RecipeStyleBlock;
  responsive: Array<
    RecipeResponsiveOverride<RecipeStyleBlock, TBreakpoint> & {
      query: "min" | "max" | "exact";
    }
  >;
};

export type InterpretedRecipeGroup<TBreakpoint extends string> = Record<
  string,
  InterpretedRecipeVariant<TBreakpoint>
>;

export type RenderedRecipeCss = {
  css: string;
  variants: Record<string, string>;
};

export type GenerateRecipeCssOptions<TBreakpoint extends string> = {
  media: MediaHelpers<TBreakpoint>;
  selectorBuilder: (variantName: string) => string;
  formatStyle?: (property: string, value: string | number) => string;
};

const defaultFormatStyle = (property: string, value: string | number): string =>
  `${property}: ${value};`;

export const generateRecipeCss = <TBreakpoint extends string>(
  group: InterpretedRecipeGroup<TBreakpoint>,
  options: GenerateRecipeCssOptions<TBreakpoint>,
): RenderedRecipeCss => {
  const formatStyle = options.formatStyle ?? defaultFormatStyle;
  const variantCssEntries: string[] = [];
  const variantMap: Record<string, string> = {};

  Object.entries(group).forEach(([variantName, variant]) => {
    const selector = options.selectorBuilder(variantName);
    variantMap[variantName] = selector;

    const baseBlock = serializeStyleBlock(variant.base, formatStyle);
    if (baseBlock) {
      variantCssEntries.push(`${selector} {\n${baseBlock}\n}`);
    }

    variant.responsive.forEach(entry => {
      const mediaGroup = options.media.groups[entry.breakpoint];
      if (!mediaGroup) {
        return;
      }

      const mediaTemplate = mediaGroup[entry.query];
      if (!mediaTemplate) {
        return;
      }

      const responsiveBlock = serializeStyleBlock(entry as RecipeStyleBlock, formatStyle, true);
      if (!responsiveBlock) {
        return;
      }

      variantCssEntries.push(
        mediaTemplate`
          ${selector} {
            ${responsiveBlock}
          }
        `.toString(),
      );
    });
  });

  return {
    css: variantCssEntries.filter(Boolean).join("\n"),
    variants: variantMap,
  };
};

const serializeStyleBlock = (
  styles: Record<string, string | number>,
  formatStyle: (property: string, value: string | number) => string,
  skipSpecialKeys = false,
): string => {
  const entries = Object.entries(styles).filter(([key]) =>
    skipSpecialKeys ? !["breakpoint", "query", "variant", "target"].includes(key) : true,
  );
  if (!entries.length) {
    return "";
  }
  return entries
    .map(([property, value]) => `  ${formatStyle(property, value)}`)
    .join("\n");
};
