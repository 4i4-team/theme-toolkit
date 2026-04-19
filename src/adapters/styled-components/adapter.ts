import { renderToCssString, renderRecipeNodes } from "../../core/common";
import type { CssRuleNode, CssVariablesNode } from "../../core/common";
import type { RenderRecipeOptions } from "../../core/common/cssRender";
import { wrapMediaDescriptor } from "./media";
import type { WrappedMediaDescriptor } from "./media";
import type { ThemeAdapter } from "../../core/theme/adapter";

/**
 * styled-components adapter.
 *
 * - `renderCss`: same CSS string output as the default adapter
 * - `resolveVariableReference`: same `var(--)` wrapping
 * - `wrapMedia`: wraps MediaDescriptor with SC tagged template functions
 *   so `theme.media.md.min\`...\`` works as a tagged template
 * - `renderRecipe`: delegates to default renderRecipeNodes
 */
export const createStyledComponentsAdapter = (): ThemeAdapter<WrappedMediaDescriptor<string>> => ({
  renderCss: (nodes) => renderToCssString(nodes),
  resolveVariableReference: (varName) => `var(${varName})`,
  wrapMedia: (descriptor) => wrapMediaDescriptor(descriptor) as unknown as WrappedMediaDescriptor<string>,
  renderRecipe: (
    rules: CssRuleNode[],
    variables: CssVariablesNode[],
    options?: RenderRecipeOptions,
  ) => renderRecipeNodes(rules, variables, options),
});
