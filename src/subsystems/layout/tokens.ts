import {
  normalizeCssVariablePrefix,
  sanitizeIdentifierSegment,
} from "../../core/common";
import type {
  CssRuleNode,
  CssVariablesNode,
  CssDeclaration,
  ResolveCssVariableName,
} from "../../core/common";
import type { MediaDescriptor } from "../../core/media";
import type {
  ColumnsValue,
  GridsDefinition,
  LayoutPropertyTokens,
  LayoutTokens,
  StacksDefinition,
} from "./types";
import { formatScalar } from "./utils";

const PROPERTY_CSS_MAP: Record<string, string> = {
  spacing: "spacing",
  gutters: "gutters",
  aspectRatio: "aspect-ratio",
};

export const tokenizeLayoutProperty = (
  name: string,
  normalized: { base: unknown; variants?: Record<string, { base: unknown }> },
  baseToken: LayoutPropertyTokens,
): LayoutPropertyTokens => {
  const variants: Record<string, string | number> = { base: normalized.base as string | number };
  if (normalized.variants) {
    for (const [variantName, def] of Object.entries(normalized.variants)) {
      variants[variantName] = def.base as string | number;
    }
  }
  return { ...baseToken, base: normalized.base as string | number, variants };
};

export const mapLayoutCssVariables = (
  tokens: LayoutTokens,
  prefix: string,
): Record<string, string> => {
  const normalizedPrefix = normalizeCssVariablePrefix(prefix);
  const variables: Record<string, string> = {};

  for (const [propertyKey, token] of Object.entries(tokens)) {
    const cssName = PROPERTY_CSS_MAP[propertyKey] ?? sanitizeIdentifierSegment(propertyKey);

    for (const [variantName, value] of Object.entries(token.variants)) {
      const formatted = propertyKey === "spacing" || propertyKey === "gutters"
        ? formatScalar(value as number)
        : String(value);
      const varName = `${normalizedPrefix}-layout-${cssName}--${sanitizeIdentifierSegment(variantName)}`;
      variables[varName] = formatted;
    }
  }

  return variables;
};

export const createLayoutCssVariableResolver = (
  prefix: string,
): ResolveCssVariableName => {
  const normalizedPrefix = normalizeCssVariablePrefix(prefix);
  return (propertyKey: string, variant?: string): string => {
    const cssName = PROPERTY_CSS_MAP[propertyKey] ?? sanitizeIdentifierSegment(propertyKey);
    const variantSegment = sanitizeIdentifierSegment(variant ?? "base");
    return `${normalizedPrefix}-layout-${cssName}--${variantSegment}`;
  };
};

export const buildColumnsNodes = (
  input: ColumnsValue | undefined,
  prefix: string,
  classPrefix: string,
  breakpoints: Record<string, number>,
  media: MediaDescriptor<string>,
): { variables: CssVariablesNode[]; rules: CssRuleNode[] } => {
  if (!input) return { variables: [], rules: [] };
  const normalizedPrefix = normalizeCssVariablePrefix(prefix);
  const config = typeof input === "number" ? { size: input } : input;
  const size = config.size;
  const gutterRef = config.gutter ?? "base";
  const insetRef = config.inset ?? "none";

  const resolve = createLayoutCssVariableResolver(prefix);
  const gutterVar = resolve("gutters", gutterRef);
  const insetVar = resolve("spacing", insetRef);

  const variables: CssVariablesNode[] = [{
    kind: "variables",
    selector: ":root",
    variables: {
      [`${normalizedPrefix}-layout-columns--size`]: String(size),
      [`${normalizedPrefix}-layout-columns--gutter`]: `var(${gutterVar})`,
      [`${normalizedPrefix}-layout-columns--inset`]: `var(${insetVar})`,
    },
  }];

  const rules: CssRuleNode[] = [];
  const sortedKeys = Object.keys(breakpoints).sort((a, b) => breakpoints[a] - breakpoints[b]);
  const spans = Array.from({ length: size }, (_, i) => i + 1);

  for (const key of sortedKeys) {
    const segment = sanitizeIdentifierSegment(key);
    const mediaQuery = media.min(key);

    for (const span of spans) {
      const colSelector = `.${classPrefix}-col-${segment}-${span}`;
      const offsetSelector = `.${classPrefix}-offset-${segment}-${span}`;

      if (breakpoints[key] === 0) {
        rules.push({ kind: "rule", selector: colSelector, declarations: [{ property: "grid-column-end", value: `span ${span}` }] });
        rules.push({ kind: "rule", selector: offsetSelector, declarations: [{ property: "grid-column-start", value: String(span + 1) }] });
      } else {
        rules.push({ kind: "rule", selector: colSelector, media: mediaQuery, declarations: [{ property: "grid-column-end", value: `span ${span}` }] });
        rules.push({ kind: "rule", selector: offsetSelector, media: mediaQuery, declarations: [{ property: "grid-column-start", value: String(span + 1) }] });
      }
    }
  }

  return { variables, rules };
};

export const buildGridNodes = (
  grids: GridsDefinition | undefined,
  classPrefix: string,
  media: MediaDescriptor<string>,
  spacingResolver: ResolveCssVariableName,
): CssRuleNode[] => {
  if (!grids) return [];
  const rules: CssRuleNode[] = [];

  for (const [name, grid] of Object.entries(grids)) {
    const selector = `.${classPrefix}-grid-${sanitizeIdentifierSegment(name)}`;
    const declarations: CssDeclaration[] = [{ property: "display", value: "grid" }];

    if (grid.templateColumns) declarations.push({ property: "grid-template-columns", value: grid.templateColumns });
    if (grid.templateRows) declarations.push({ property: "grid-template-rows", value: grid.templateRows });
    if (grid.autoRows) declarations.push({ property: "grid-auto-rows", value: grid.autoRows });
    if (grid.autoColumns) declarations.push({ property: "grid-auto-columns", value: grid.autoColumns });
    if (grid.justifyItems) declarations.push({ property: "justify-items", value: grid.justifyItems });
    if (grid.alignItems) declarations.push({ property: "align-items", value: grid.alignItems });
    if (grid.justifyContent) declarations.push({ property: "justify-content", value: grid.justifyContent });
    if (grid.alignContent) declarations.push({ property: "align-content", value: grid.alignContent });
    if (grid.gap) declarations.push({ property: "gap", value: `var(${spacingResolver("spacing", grid.gap)})` });

    rules.push({ kind: "rule", selector, declarations });

    for (const entry of grid.responsive ?? []) {
      const group = media[entry.breakpoint];
      if (!group) continue;
      const mediaQuery = group[entry.query ?? "exact"];
      if (!mediaQuery) continue;

      const respDeclarations: CssDeclaration[] = [];
      if (entry.templateColumns) respDeclarations.push({ property: "grid-template-columns", value: entry.templateColumns });
      if (entry.templateRows) respDeclarations.push({ property: "grid-template-rows", value: entry.templateRows });
      if (entry.autoRows) respDeclarations.push({ property: "grid-auto-rows", value: entry.autoRows });
      if (entry.autoColumns) respDeclarations.push({ property: "grid-auto-columns", value: entry.autoColumns });
      if (entry.justifyItems) respDeclarations.push({ property: "justify-items", value: entry.justifyItems });
      if (entry.alignItems) respDeclarations.push({ property: "align-items", value: entry.alignItems });
      if (entry.justifyContent) respDeclarations.push({ property: "justify-content", value: entry.justifyContent });
      if (entry.alignContent) respDeclarations.push({ property: "align-content", value: entry.alignContent });
      if (entry.gap) respDeclarations.push({ property: "gap", value: `var(${spacingResolver("spacing", entry.gap)})` });

      if (respDeclarations.length) {
        rules.push({ kind: "rule", selector, media: mediaQuery, declarations: respDeclarations });
      }
    }
  }

  return rules;
};

export const buildStackNodes = (
  stacks: StacksDefinition | undefined,
  classPrefix: string,
  media: MediaDescriptor<string>,
  spacingResolver: ResolveCssVariableName,
): CssRuleNode[] => {
  if (!stacks) return [];
  const rules: CssRuleNode[] = [];

  for (const [name, stack] of Object.entries(stacks)) {
    const selector = `.${classPrefix}-stack-${sanitizeIdentifierSegment(name)}`;
    const declarations: CssDeclaration[] = [
      { property: "display", value: stack.inline ? "inline-flex" : "flex" },
      { property: "flex-direction", value: stack.direction ?? "column" },
    ];

    if (stack.align) declarations.push({ property: "align-items", value: stack.align });
    if (stack.justify) declarations.push({ property: "justify-content", value: stack.justify });
    if (stack.wrap) declarations.push({ property: "flex-wrap", value: stack.wrap });
    if (stack.gap) declarations.push({ property: "gap", value: `var(${spacingResolver("spacing", stack.gap)})` });

    rules.push({ kind: "rule", selector, declarations });

    for (const entry of stack.responsive ?? []) {
      const group = media[entry.breakpoint];
      if (!group) continue;
      const mediaQuery = group[entry.query ?? "exact"];
      if (!mediaQuery) continue;

      const respDeclarations: CssDeclaration[] = [];
      if (entry.inline !== undefined) respDeclarations.push({ property: "display", value: entry.inline ? "inline-flex" : "flex" });
      if (entry.direction) respDeclarations.push({ property: "flex-direction", value: entry.direction });
      if (entry.align) respDeclarations.push({ property: "align-items", value: entry.align });
      if (entry.justify) respDeclarations.push({ property: "justify-content", value: entry.justify });
      if (entry.wrap) respDeclarations.push({ property: "flex-wrap", value: entry.wrap });

      if (respDeclarations.length) {
        rules.push({ kind: "rule", selector, media: mediaQuery, declarations: respDeclarations });
      }
    }
  }

  return rules;
};

export const buildContainerNodes = (
  container: Record<string, { base: unknown; variants?: Record<string, unknown> }> | undefined,
  prefix: string,
  classPrefix: string,
  breakpoints: Record<string, number>,
  media: MediaDescriptor<string>,
  spacingResolver: ResolveCssVariableName,
): { variables: CssVariablesNode[]; rules: CssRuleNode[] } => {
  if (!container) {
    return buildDefaultContainerNodes(prefix, classPrefix, breakpoints, media, spacingResolver);
  }
  return buildDefaultContainerNodes(prefix, classPrefix, breakpoints, media, spacingResolver);
};

const buildDefaultContainerNodes = (
  prefix: string,
  classPrefix: string,
  breakpoints: Record<string, number>,
  media: MediaDescriptor<string>,
  spacingResolver: ResolveCssVariableName,
): { variables: CssVariablesNode[]; rules: CssRuleNode[] } => {
  const normalizedPrefix = normalizeCssVariablePrefix(prefix);
  const insetVar = spacingResolver("spacing", "base");

  const variables: CssVariablesNode[] = [{
    kind: "variables",
    selector: ":root",
    variables: {
      [`${normalizedPrefix}-layout-container--inset`]: `var(${insetVar})`,
    },
  }];

  const selector = `.${classPrefix}-container`;
  const declarations: CssDeclaration[] = [
    { property: "box-sizing", value: "border-box" },
    { property: "width", value: "100%" },
    { property: "margin-left", value: "auto" },
    { property: "margin-right", value: "auto" },
    { property: "padding-left", value: `var(${normalizedPrefix}-layout-container--inset)` },
    { property: "padding-right", value: `var(${normalizedPrefix}-layout-container--inset)` },
  ];

  const rules: CssRuleNode[] = [{ kind: "rule", selector, declarations }];

  const sortedKeys = Object.keys(breakpoints).sort((a, b) => breakpoints[a] - breakpoints[b]);
  for (const key of sortedKeys) {
    const width = breakpoints[key];
    if (width === 0) continue;
    const mediaQuery = media.min(key);
    rules.push({
      kind: "rule",
      selector,
      media: mediaQuery,
      declarations: [{ property: "max-width", value: `${width}px` }],
    });
  }

  return { variables, rules };
};
