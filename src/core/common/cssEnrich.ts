import type { CssNode, CssRuleNode, CssVariablesNode } from "./cssNodes";

const VAR_PATTERN = /var\((--[^)]+)\)/;

/**
 * Enrich CssRuleNode declarations with `ref` and `resolved` fields
 * by cross-referencing against the variable nodes.
 *
 * Mutates the nodes in place for efficiency. Call after all nodes are built.
 */
export const enrichDeclarationsWithRefs = (nodes: CssNode[]): void => {
  // Build a lookup from variable name → resolved value
  const variableMap = new Map<string, string>();
  for (const node of nodes) {
    if (node.kind !== "variables") continue;
    for (const [name, value] of Object.entries(node.variables)) {
      // Only store non-var values (skip variables that reference other variables)
      if (!VAR_PATTERN.test(value)) {
        variableMap.set(name, value);
      }
    }
  }

  // Second pass for variables that reference other variables (one level)
  for (const node of nodes) {
    if (node.kind !== "variables") continue;
    for (const [name, value] of Object.entries(node.variables)) {
      if (variableMap.has(name)) continue;
      const match = value.match(VAR_PATTERN);
      if (match) {
        const resolved = variableMap.get(match[1]);
        if (resolved) variableMap.set(name, resolved);
      }
    }
  }

  // Enrich rule declarations
  for (const node of nodes) {
    if (node.kind !== "rule") continue;
    for (const decl of node.declarations) {
      if (typeof decl.value !== "string") continue;
      const match = decl.value.match(VAR_PATTERN);
      if (!match) continue;

      const varName = match[1];
      decl.ref = varName;

      const resolved = variableMap.get(varName);
      if (resolved !== undefined) {
        decl.resolved = resolved;
      }
    }
  }
};

/**
 * Collect the variable names referenced by a set of rule nodes.
 */
export const collectVariableRefs = (rules: CssRuleNode[]): Set<string> => {
  const refs = new Set<string>();
  for (const rule of rules) {
    for (const decl of rule.declarations) {
      if (decl.ref) {
        refs.add(decl.ref);
      } else if (typeof decl.value === "string") {
        const match = decl.value.match(VAR_PATTERN);
        if (match) refs.add(match[1]);
      }
    }
  }
  return refs;
};

/**
 * Filter variable nodes to only include the specified variable names.
 */
export const filterVariableNodes = (
  nodes: CssVariablesNode[],
  refs: Set<string>,
): CssVariablesNode[] => {
  const result: CssVariablesNode[] = [];
  for (const node of nodes) {
    const filtered: Record<string, string> = {};
    for (const [name, value] of Object.entries(node.variables)) {
      if (refs.has(name)) {
        filtered[name] = value;
        // Also include variables that this variable references
        const match = value.match(VAR_PATTERN);
        if (match) refs.add(match[1]);
      }
    }
    if (Object.keys(filtered).length) {
      result.push({ ...node, variables: filtered });
    }
  }
  return result;
};
