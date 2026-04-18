import type { SubsystemThemeHelper } from "../../core/theme/helpers";
import { interpretComponentsRecipeVariant } from "./recipes";

export const createComponentsThemeHelper = (): SubsystemThemeHelper =>
  ({
    key: "components",
    dependsOn: ["colors", "typography", "layout", "effects"],
    interpretRecipe: (variantName: string, variant: any, context: any) =>
      interpretComponentsRecipeVariant(variantName, variant, context),
  }) as unknown as SubsystemThemeHelper;
