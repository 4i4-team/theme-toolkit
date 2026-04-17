import type { SubsystemThemeHelper, SubsystemSliceContext } from "../../core/theme/helpers";
import type { TypographySource, TypographyBuilderOptions } from "./types";
import { buildTypographyTokens, createTypographyStyle } from "./tokens";

export const createTypographyThemeHelper = (): SubsystemThemeHelper =>
  ({
    key: "typography",
    buildSlice: (context: SubsystemSliceContext) => {
      const source = context.source as TypographySource | undefined;
      if (!source) return {};
      const options = context.options as TypographyBuilderOptions | undefined;
      const tokens = buildTypographyTokens(source, { unit: options?.unit ?? "px" });
      return {
        style: (group: string, variant: string) => createTypographyStyle(tokens, group, variant),
      };
    },
  }) as unknown as SubsystemThemeHelper;
