import { renderToCssString, enrichDeclarationsWithRefs, renderRecipeNodes } from "../common";
import type { CssNode, CssRuleNode, CssVariablesNode } from "../common";
import type { RenderRecipeOptions } from "../common/cssRender";
import type { MediaDescriptor } from "../media";
import type { ThemeAdapter } from "./adapter";

/**
 * Options for the default CSS adapter.
 */
export type CssAdapterOptions = {
  /**
   * Inline resolved values instead of CSS variable references.
   * `background: #4dabf7` instead of `background: var(--app-colors-primary)`.
   */
  inline?: boolean;

  /**
   * Scope variable names with a prefix for MFE / micro-frontend isolation.
   * `--checkout-colors-primary` instead of `--app-colors-primary`.
   */
  scope?: string;
};

/**
 * Default adapter — plain CSS output.
 *
 * Without options: `var(--)` references, global `:root` variables, plain media strings.
 * With `{ inline: true }`: resolved values, no variable blocks.
 * With `{ scope: "name" }`: variables namespaced for MFE isolation.
 */
export const createCssAdapter = (
  adapterOptions?: CssAdapterOptions,
): ThemeAdapter<MediaDescriptor<string>> => {
  const defaultInline = adapterOptions?.inline ?? false;
  const defaultScope = adapterOptions?.scope;

  return {
    renderCss: (nodes: CssNode[]): string => {
      if (!defaultInline && !defaultScope) {
        return renderToCssString(nodes);
      }
      if (defaultInline) {
        // Inline mode for full CSS: resolve values in declarations, render as CSS string (no variables)
        enrichDeclarationsWithRefs(nodes);
        const inlinedNodes: CssNode[] = nodes
          .filter((n): n is CssRuleNode => n.kind === "rule")
          .map(rule => ({
            ...rule,
            declarations: rule.declarations.map(decl =>
              decl.resolved !== undefined
                ? { property: decl.property, value: decl.resolved }
                : { property: decl.property, value: decl.value },
            ),
          }));
        return renderToCssString(inlinedNodes);
      }
      // Scoped mode: rename all variables and their references
      const scopedNodes = nodes.map(node => {
        if (node.kind === "variables") {
          return {
            ...node,
            variables: Object.fromEntries(
              Object.entries(node.variables).map(([name, value]) => {
                const scopedName = scopeVariableName(name, defaultScope!);
                const scopedValue = value.replace(
                  /var\((--[^)]+)\)/g,
                  (_, ref: string) => `var(${scopeVariableName(ref, defaultScope!)})`,
                );
                return [scopedName, scopedValue];
              }),
            ),
          } as CssVariablesNode;
        }
        return {
          ...node,
          declarations: (node as CssRuleNode).declarations.map(decl => {
            if (typeof decl.value !== "string") return decl;
            return {
              ...decl,
              value: decl.value.replace(
                /var\((--[^)]+)\)/g,
                (_, ref: string) => `var(${scopeVariableName(ref, defaultScope!)})`,
              ),
            };
          }),
        } as CssRuleNode;
      });
      return renderToCssString(scopedNodes);
    },

    resolveVariableReference: (varName: string): string => {
      if (defaultInline) {
        // When inline, we still produce var() during interpretation.
        // The actual inlining happens at render time via ref/resolved.
        return `var(${varName})`;
      }
      if (defaultScope) {
        const scoped = scopeVariableName(varName, defaultScope);
        return `var(${scoped})`;
      }
      return `var(${varName})`;
    },

    wrapMedia: <TBreakpoint extends string>(descriptor: MediaDescriptor<TBreakpoint>) =>
      descriptor as unknown as MediaDescriptor<string>,

    renderRecipe: (
      rules: CssRuleNode[],
      variables: CssVariablesNode[],
      options?: RenderRecipeOptions,
    ): string | Record<string, string | number> => {
      // Merge adapter defaults with per-call options (per-call wins)
      const merged: RenderRecipeOptions = {
        inline: options?.inline ?? defaultInline,
        scope: options?.scope ?? defaultScope,
        includeVariables: options?.includeVariables,
      };
      return renderRecipeNodes(rules, variables, merged as any);
    },
  };
};

const scopeVariableName = (varName: string, scope: string): string => {
  const withoutDashes = varName.replace(/^--/, "");
  const firstDash = withoutDashes.indexOf("-");
  if (firstDash === -1) return `--${scope}`;
  return `--${scope}${withoutDashes.substring(firstDash)}`;
};
