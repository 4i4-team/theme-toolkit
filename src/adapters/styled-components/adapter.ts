import { renderToCssString } from "../../core/common";
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
 */
export const createStyledComponentsAdapter = (): ThemeAdapter<WrappedMediaDescriptor<string>> => ({
  renderCss: (nodes) => renderToCssString(nodes),
  resolveVariableReference: (varName) => `var(${varName})`,
  wrapMedia: (descriptor) => wrapMediaDescriptor(descriptor) as unknown as WrappedMediaDescriptor<string>,
});
