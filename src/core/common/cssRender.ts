import type { CssNode, CssRuleNode, CssVariablesNode } from "./cssNodes";
import { renderToCssString } from "./cssRenderer";
import { collectVariableRefs, filterVariableNodes } from "./cssEnrich";

export type RenderRecipeOptions = {
  /**
   * Return a style object with resolved values for direct use on elements.
   * `{ background: "#4dabf7", color: "#fff" }` instead of a CSS string.
   * When true, the return type is `Record<string, string | number>`.
   */
  inline?: boolean;

  /**
   * Scope variable names with a prefix. Prevents collisions in MFE / micro-frontend setups.
   * `scope: "checkout"` turns `--app-colors-primary` into `--checkout-colors-primary`.
   */
  scope?: string;

  /**
   * Include the CSS variables that the recipe references.
   * Default: true. Set to false if variables are delivered separately.
   * Ignored when `inline: true`.
   */
  includeVariables?: boolean;
};

/**
 * Render a set of recipe rule nodes.
 *
 * - Default: returns a CSS string with var(--) references + variable block.
 * - `inline: true`: returns a flat style object with resolved values.
 * - `scope`: returns a CSS string with scoped variable names.
 */
export function renderRecipeNodes(
  rules: CssRuleNode[],
  allVariableNodes: CssVariablesNode[],
  options: RenderRecipeOptions & { inline: true },
): Record<string, string | number>;
export function renderRecipeNodes(
  rules: CssRuleNode[],
  allVariableNodes: CssVariablesNode[],
  options?: RenderRecipeOptions,
): string;
export function renderRecipeNodes(
  rules: CssRuleNode[],
  allVariableNodes: CssVariablesNode[],
  options?: RenderRecipeOptions,
): string | Record<string, string | number> {
  const inline = options?.inline ?? false;
  const scope = options?.scope;
  const includeVariables = options?.includeVariables ?? true;

  // Inline: return a flat style object
  if (inline) {
    const styles: Record<string, string | number> = {};
    for (const rule of rules) {
      for (const decl of rule.declarations) {
        if (decl.resolved !== undefined) {
          styles[decl.property] = decl.resolved;
        } else {
          styles[decl.property] = decl.value;
        }
      }
    }
    return styles;
  }

  // CSS string output
  const nodes: CssNode[] = [];

  // Collect and transform variables
  if (includeVariables) {
    const refs = collectVariableRefs(rules);
    let variables = filterVariableNodes(allVariableNodes, refs);
    if (scope) {
      variables = scopeVariableNodes(variables, scope);
    }
    nodes.push(...variables);
  }

  // Transform rules
  for (const rule of rules) {
    const declarations = rule.declarations.map(decl => {
      if (scope && decl.ref) {
        const scopedRef = scopeVariableName(decl.ref, scope);
        return { property: decl.property, value: `var(${scopedRef})` };
      }
      return { property: decl.property, value: decl.value };
    });

    nodes.push({
      kind: "rule",
      selector: rule.selector,
      media: rule.media,
      declarations,
    });
  }

  return renderToCssString(nodes);
}

/**
 * Split nodes into variables and rules.
 */
export const splitNodes = (nodes: CssNode[]): {
  variables: CssVariablesNode[];
  rules: CssRuleNode[];
} => {
  const variables: CssVariablesNode[] = [];
  const rules: CssRuleNode[] = [];
  for (const node of nodes) {
    if (node.kind === "variables") variables.push(node);
    else rules.push(node);
  }
  return { variables, rules };
};

/**
 * Render only the variable nodes from an IR.
 */
export const renderVariablesCss = (nodes: CssNode[]): string => {
  const { variables } = splitNodes(nodes);
  return renderToCssString(variables);
};

/**
 * Render only the rule nodes from an IR.
 */
export const renderRulesCss = (nodes: CssNode[]): string => {
  const { rules } = splitNodes(nodes);
  return renderToCssString(rules);
};

// --- Scoping helpers ---

const scopeVariableName = (varName: string, scope: string): string => {
  // --app-colors-primary → --checkout-colors-primary
  // Replace the first segment (after --) with the scope
  const withoutDashes = varName.replace(/^--/, "");
  const firstDash = withoutDashes.indexOf("-");
  if (firstDash === -1) return `--${scope}`;
  return `--${scope}${withoutDashes.substring(firstDash)}`;
};

const scopeVariableNodes = (
  nodes: CssVariablesNode[],
  scope: string,
): CssVariablesNode[] =>
  nodes.map(node => ({
    ...node,
    variables: Object.fromEntries(
      Object.entries(node.variables).map(([name, value]) => {
        const scopedName = scopeVariableName(name, scope);
        // Also scope any var() references in the value
        const scopedValue = value.replace(
          /var\((--[^)]+)\)/g,
          (_, ref) => `var(${scopeVariableName(ref, scope)})`,
        );
        return [scopedName, scopedValue];
      }),
    ),
  }));
