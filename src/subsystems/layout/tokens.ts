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

type ContainerConfig = {
  mode: string;
  inset?: string;
  gutter?: string;
  direction?: string;
  align?: string;
  justify?: string;
  maxWidth?: string | number;
};

const resolveContainerConfig = (raw: unknown): ContainerConfig => {
  if (!raw || typeof raw === "string") {
    return { mode: raw as string ?? "fixed" };
  }
  const obj = raw as Record<string, unknown>;
  return {
    mode: (obj.base as string) ?? "fixed",
    inset: obj.inset as string | undefined,
    gutter: obj.gutter as string | undefined,
    direction: obj.direction as string | undefined,
    align: obj.align as string | undefined,
    justify: obj.justify as string | undefined,
    maxWidth: obj.maxWidth as string | number | undefined,
  };
};

export const buildContainerNodes = (
  containerInput: unknown,
  prefix: string,
  classPrefix: string,
  breakpoints: Record<string, number>,
  media: MediaDescriptor<string>,
  spacingResolver: ResolveCssVariableName,
): { variables: CssVariablesNode[]; rules: CssRuleNode[] } => {
  const normalizedPrefix = normalizeCssVariablePrefix(prefix);
  const allVariables: Record<string, string> = {};
  const allRules: CssRuleNode[] = [];
  const sortedKeys = Object.keys(breakpoints).sort((a, b) => breakpoints[a] - breakpoints[b]);

  const extended = containerInput && typeof containerInput === "object"
    ? containerInput as Record<string, unknown>
    : undefined;

  const baseConfig: ContainerConfig = extended
    ? {
        mode: (extended.base as string) ?? "fixed",
        inset: extended.inset as string | undefined,
        gutter: extended.gutter as string | undefined,
        direction: extended.direction as string | undefined,
        align: extended.align as string | undefined,
        justify: extended.justify as string | undefined,
        maxWidth: extended.maxWidth as string | number | undefined,
      }
    : resolveContainerConfig(containerInput ?? "fixed");
  const variants = (extended?.variants as Record<string, unknown>) ?? {};
  const responsiveEntries = (extended?.responsive as Array<Record<string, unknown>>) ?? [];

  const selectorForTarget = (target?: string): string =>
    target
      ? `.${classPrefix}-container-${sanitizeIdentifierSegment(target)}`
      : `.${classPrefix}-container`;

  const buildSingleContainer = (name: string | null, config: ContainerConfig) => {
    const suffix = name ? `--${sanitizeIdentifierSegment(name)}` : "";
    const selector = name
      ? `.${classPrefix}-container-${sanitizeIdentifierSegment(name)}`
      : `.${classPrefix}-container`;

    const insetRef = config.inset ?? baseConfig.inset ?? "base";
    const gutterRef = config.gutter ?? baseConfig.gutter;
    const mode = config.mode ?? baseConfig.mode ?? "fixed";
    const direction = config.direction ?? baseConfig.direction;
    const align = config.align ?? baseConfig.align;
    const justify = config.justify ?? baseConfig.justify;
    const maxWidthValue = config.maxWidth ?? (name ? baseConfig.maxWidth : undefined);

    const insetVarName = `${normalizedPrefix}-layout-container${suffix}--inset`;
    allVariables[insetVarName] = `var(${spacingResolver("spacing", insetRef)})`;

    if (gutterRef) {
      const gutterVarName = `${normalizedPrefix}-layout-container${suffix}--gutter`;
      allVariables[gutterVarName] = `var(${spacingResolver("gutters", gutterRef)})`;
    }

    const declarations: CssDeclaration[] = [
      { property: "box-sizing", value: "border-box" },
      { property: "width", value: "100%" },
      { property: "margin-left", value: "auto" },
      { property: "margin-right", value: "auto" },
      { property: "padding-left", value: `var(${insetVarName})` },
      { property: "padding-right", value: `var(${insetVarName})` },
    ];

    if (gutterRef) {
      const gutterVarName = `${normalizedPrefix}-layout-container${suffix}--gutter`;
      declarations.push({ property: "gap", value: `var(${gutterVarName})` });
    }

    if (direction) {
      declarations.push({ property: "display", value: "flex" });
      declarations.push({ property: "flex-direction", value: direction });
    }
    if (align) declarations.push({ property: "align-items", value: align });
    if (justify) declarations.push({ property: "justify-content", value: justify });

    if (mode === "fixed") {
      const maxBp = typeof maxWidthValue === "string" && breakpoints[maxWidthValue] !== undefined
        ? maxWidthValue
        : undefined;
      const maxBpIndex = maxBp ? sortedKeys.indexOf(maxBp) : -1;

      for (let i = 0; i < sortedKeys.length; i++) {
        const key = sortedKeys[i];
        const refKey = maxBpIndex >= 0 && i > maxBpIndex ? maxBp! : key;
        const width = breakpoints[refKey];
        if (width === 0) {
          if (i === 0) declarations.push({ property: "max-width", value: "none" });
          continue;
        }
        if (i === 0) {
          declarations.push({ property: "max-width", value: `${width}px` });
        } else {
          allRules.push({
            kind: "rule", selector,
            media: media.min(key),
            declarations: [{ property: "max-width", value: `${width}px` }],
          });
        }
      }
    } else if (mode === "fluid") {
      if (maxWidthValue !== undefined) {
        const resolved = typeof maxWidthValue === "number"
          ? `${maxWidthValue}px`
          : breakpoints[maxWidthValue] !== undefined
            ? `${breakpoints[maxWidthValue]}px`
            : String(maxWidthValue);
        declarations.push({ property: "max-width", value: resolved });
      }
    } else {
      const customWidth = typeof mode === "number" ? `${mode}px` : mode;
      declarations.push({ property: "max-width", value: customWidth });
    }

    allRules.unshift({ kind: "rule", selector, declarations });
  };

  buildSingleContainer(null, baseConfig);

  for (const [name, raw] of Object.entries(variants)) {
    const variantConfig = resolveContainerConfig(raw);
    buildSingleContainer(name, variantConfig);
  }

  for (const entry of responsiveEntries) {
    const breakpoint = entry.breakpoint as string;
    const query = (entry.query as string) ?? "exact";
    const target = entry.target as string | undefined;

    const group = media[breakpoint];
    if (!group) continue;
    const mediaQuery = group[query as "min" | "max" | "exact"];
    if (!mediaQuery) continue;

    const selector = selectorForTarget(target);
    const declarations: CssDeclaration[] = [];

    if (entry.direction) declarations.push({ property: "flex-direction", value: entry.direction as string });
    if (entry.align) declarations.push({ property: "align-items", value: entry.align as string });
    if (entry.justify) declarations.push({ property: "justify-content", value: entry.justify as string });
    if (entry.inset) {
      const insetVar = spacingResolver("spacing", entry.inset as string);
      declarations.push({ property: "padding-left", value: `var(${insetVar})` });
      declarations.push({ property: "padding-right", value: `var(${insetVar})` });
    }
    if (entry.gutter) {
      const gutterVar = spacingResolver("gutters", entry.gutter as string);
      declarations.push({ property: "gap", value: `var(${gutterVar})` });
    }

    if (declarations.length) {
      allRules.push({ kind: "rule", selector, media: mediaQuery, declarations });
    }
  }

  const variables: CssVariablesNode[] = Object.keys(allVariables).length
    ? [{ kind: "variables" as const, selector: ":root", variables: allVariables }]
    : [];

  return { variables, rules: allRules };
};
