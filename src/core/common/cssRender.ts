import type { CssNode, CssRuleNode, CssVariablesNode } from "./cssNodes";
import { renderToCssString } from "./cssRenderer";
import { collectVariableRefs, filterVariableNodes } from "./cssEnrich";

export type RenderRecipeOptions = {
  /**
   * Inline resolved values directly instead of using CSS variable references.
   * Produces `background: #4dabf7` instead of `background: var(--app-colors-primary)`.
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
   */
  includeVariables?: boolean;
};

/**
 * Render a set of recipe rule nodes with options for inline values, scoping, etc.
 *
 * @param rules - The CssRuleNode[] for the recipe variant(s)
 * @param allVariableNodes - The full set of variable nodes to pull referenced vars from
 * @param options - Rendering options
 * @returns CSS string
 */
export const renderRecipeNodes = (
  rules: CssRuleNode[],
  allVariableNodes: CssVariablesNode[],
  options?: RenderRecipeOptions,
): string => {
  const inline = options?.inline ?? false;
  const scope = options?.scope;
  const includeVariables = options?.includeVariables ?? true;

  const nodes: CssNode[] = [];

  // Collect and transform variables
  if (includeVariables && !inline) {
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
      if (inline && decl.resolved !== undefined) {
        return { property: decl.property, value: decl.resolved };
      }
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
};

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
