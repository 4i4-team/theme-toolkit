import { renderToCssString } from "../common";
import type { MediaDescriptor } from "../media";
import type { ThemeAdapter } from "./adapter";

/**
 * Default adapter — plain CSS output.
 *
 * - `renderCss`: renders IR to a CSS string via `renderToCssString`
 * - `resolveVariableReference`: wraps names in `var(--name)`
 * - `wrapMedia`: passes the MediaDescriptor through unchanged (plain strings)
 */
export const createCssAdapter = (): ThemeAdapter<MediaDescriptor<string>> => ({
  renderCss: (nodes) => renderToCssString(nodes),
  resolveVariableReference: (varName) => `var(${varName})`,
  wrapMedia: <TBreakpoint extends string>(descriptor: MediaDescriptor<TBreakpoint>) =>
    descriptor as unknown as MediaDescriptor<string>,
});
