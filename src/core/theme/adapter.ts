import type { CssNode } from "../common";
import type { MediaDescriptor } from "../media";

/**
 * Controls how createTheme renders its output.
 *
 * The default CSS adapter produces plain CSS strings, `var(--)` references,
 * and passes media descriptors through unchanged.
 *
 * Custom adapters can target other platforms:
 * - styled-components: wrap media with tagged template functions
 * - SASS: render $variables and @mixin blocks
 * - LESS: render @variables
 * - React Native: inline resolved values into StyleSheet objects
 *
 * @typeParam TMediaOutput The type returned by `wrapMedia`. Defaults to
 *   `MediaDescriptor` (plain query strings). The SC adapter returns
 *   `WrappedMediaDescriptor` (tagged template functions).
 */
export interface ThemeAdapter<TMediaOutput = unknown> {
  /** Convert IR nodes into the output format (CSS string, SCSS, etc.) */
  renderCss(nodes: CssNode[]): string;

  /** Wrap a CSS variable name for use in declarations.
   *  CSS default: `(name) => \`var(\${name})\``
   *  SASS: `(name) => \`$\${name.replace(/^--/, '')}\``
   */
  resolveVariableReference(variableName: string): string;

  /** Transform the plain MediaDescriptor into framework-specific helpers. */
  wrapMedia<TBreakpoint extends string>(
    descriptor: MediaDescriptor<TBreakpoint>,
  ): TMediaOutput;

  /** Attach extra utilities to the theme root. */
  extend?(theme: Record<string, unknown>): Record<string, unknown>;
}
