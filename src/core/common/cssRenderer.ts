import type { CssNode, CssRuleNode } from "./cssNodes";
import type { CssVariableMap } from "./cssVariables";

export type RenderCssOptions = {
  indent?: string;
  newline?: string;
};

const DEFAULT_INDENT = "  ";
const DEFAULT_NEWLINE = "\n";

/**
 * Render an IR (`CssNode[]`) to a CSS string.
 *
 * Adjacent variable nodes that share the same `selector` + `media` are merged
 * into a single block so two subsystems that both contribute `:root` variables
 * produce one `:root { ... }` block instead of two.
 */
export const renderToCssString = (
  nodes: CssNode[],
  options: RenderCssOptions = {},
): string => {
  const indent = options.indent ?? DEFAULT_INDENT;
  const newline = options.newline ?? DEFAULT_NEWLINE;
  const blocks: string[] = [];

  const merged = mergeAdjacentVariableNodes(nodes);

  for (const node of merged) {
    const body =
      node.kind === "variables"
        ? renderVariableBody(node.variables, indent, newline)
        : renderRuleBody(node.declarations, indent, newline);

    if (!body) continue;

    const inner = `${node.selector} {${newline}${body}${newline}}`;
    if (node.media) {
      blocks.push(
        `${node.media} {${newline}${indentBlock(inner, indent, newline)}${newline}}`,
      );
    } else {
      blocks.push(inner);
    }
  }

  return blocks.filter(Boolean).join(`${newline}${newline}`);
};

/**
 * Collapse runs of variable nodes with identical `selector` + `media` into one
 * node. Preserves the original ordering of rule nodes and variable-node groups.
 */
const mergeAdjacentVariableNodes = (nodes: CssNode[]): CssNode[] => {
  const keyFor = (node: CssNode): string =>
    node.kind === "variables" ? `var:${node.media ?? ""}:${node.selector}` : "";

  const output: CssNode[] = [];
  for (const node of nodes) {
    if (node.kind !== "variables") {
      output.push(node);
      continue;
    }
    const key = keyFor(node);
    const previous = output[output.length - 1];
    if (
      previous &&
      previous.kind === "variables" &&
      keyFor(previous) === key
    ) {
      previous.variables = { ...previous.variables, ...node.variables };
    } else {
      output.push({
        kind: "variables",
        selector: node.selector,
        media: node.media,
        variables: { ...node.variables },
      });
    }
  }
  return output;
};

const renderVariableBody = (
  variables: CssVariableMap,
  indent: string,
  newline: string,
): string => {
  const entries = Object.entries(variables);
  if (!entries.length) return "";
  return entries
    .map(([name, value]) => `${indent}${name}: ${value};`)
    .join(newline);
};

const renderRuleBody = (
  declarations: CssRuleNode["declarations"],
  indent: string,
  newline: string,
): string => {
  if (!declarations.length) return "";
  return declarations
    .map(({ property, value }) => `${indent}${property}: ${value};`)
    .join(newline);
};

const indentBlock = (block: string, indent: string, newline: string): string =>
  block
    .split(newline)
    .map(line => (line.length ? `${indent}${line}` : line))
    .join(newline);
