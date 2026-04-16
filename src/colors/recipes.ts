import {
  assignRecipeClasses,
  generateRecipeCss,
  normalizeRecipeGroup,
  sanitizeIdentifierSegment,
} from "../common";
import type { NormalizedRecipeGroup, RecipeResponsiveOverride, RecipeStyleBlock } from "../common";
import type { MediaHelpers } from "../media";
import type {
  PaletteBuilderOptions,
  PaletteCollection,
  PaletteRecipeBuildOptions,
  PaletteRecipeProps,
  PaletteRecipeRegistry,
  PaletteRecipeSource,
  PaletteRecipeStyleMap,
  PaletteRecipeVariantStyles,
  PaletteTokens,
} from "./types";

const DEFAULT_RECIPE_CLASS_PREFIX = "dt-color";
const RESERVED_RECIPE_KEYS = new Set(["breakpoint", "query", "variant", "target"]);

export function buildPaletteRecipes<TColor extends string, TBreakpoint extends string>(
  source: PaletteRecipeSource<TBreakpoint> | undefined,
  tokens: Record<TColor, PaletteTokens>,
  options: PaletteRecipeBuildOptions<TBreakpoint>,
): PaletteRecipeRegistry<TBreakpoint> {
  if (!source || !Object.keys(source).length) {
    return {
      css: "",
      selectors: {},
      classes: {},
      styles: {},
    };
  }

  const allowedBreakpoints = Object.keys(options.breakpoints) as TBreakpoint[];
  const cssParts: string[] = [];
  const selectors: Record<string, Record<string, string>> = {};
  const classes: Record<string, Record<string, string>> = {};
  const styles: Record<string, PaletteRecipeStyleMap<TBreakpoint>> = {};

  Object.entries(source).forEach(([groupName, groupDefinition]) => {
    const normalized = normalizeRecipeGroup(groupDefinition, {
      propertyPath: `palette.recipes.${groupName}`,
      allowedBreakpoints,
    });

    const interpreted = interpretPaletteRecipeGroup(normalized, tokens, {
      groupPath: `palette.recipes.${groupName}`,
    });

    styles[groupName] = interpreted;

    const selectorPrefix = buildRecipeSelectorPrefix(options.classPrefix, groupName);
    const { css, variants } = generateRecipeCss(interpreted, {
      media: options.media,
      selectorBuilder: variantName =>
        `.${selectorPrefix}-${sanitizeIdentifierSegment(variantName)}`,
    });

    if (css) {
      cssParts.push(css);
    }

    selectors[groupName] = variants;

    const classEntries = assignRecipeClasses(variants, {
      prefix: selectorPrefix,
    });

    classes[groupName] = classEntries.reduce<Record<string, string>>((acc, entry) => {
      acc[entry.variant] = entry.className;
      return acc;
    }, {});
  });

  return {
    css: cssParts.join("\n"),
    selectors,
    classes,
    styles,
  };
}

const buildRecipeSelectorPrefix = (prefix: string | undefined, groupName: string): string => {
  const base = sanitizeIdentifierSegment(prefix ?? DEFAULT_RECIPE_CLASS_PREFIX) || DEFAULT_RECIPE_CLASS_PREFIX;
  const groupSegment = sanitizeIdentifierSegment(groupName);
  return groupSegment ? `${base}-${groupSegment}` : base;
};

const interpretPaletteRecipeGroup = <
  TColor extends string,
  TBreakpoint extends string,
>(
  group: NormalizedRecipeGroup<PaletteRecipeProps, TBreakpoint>,
  tokens: Record<TColor, PaletteTokens>,
  options: { groupPath: string },
): PaletteRecipeStyleMap<TBreakpoint> => {
  const interpreted = {} as PaletteRecipeStyleMap<TBreakpoint>;
  const baseCache = new Map<string, RecipeStyleBlock>();
  const resolving = new Set<string>();

  const resolveVariantBase = (variantName: string): RecipeStyleBlock => {
    if (baseCache.has(variantName)) {
      return baseCache.get(variantName)!;
    }

    const variant = group[variantName];
    if (!variant) {
      throw new Error(`Recipe variant "${variantName}" is not defined in ${options.groupPath}.`);
    }

    if (resolving.has(variantName)) {
      throw new Error(
        `Circular recipe variant reference detected for ${options.groupPath}.${variantName}.`,
      );
    }

    resolving.add(variantName);
    const resolved = interpretRecipeProps(variant.base, tokens, `${options.groupPath}.${variantName}`);
    resolving.delete(variantName);
    baseCache.set(variantName, resolved);
    return resolved;
  };

  Object.entries(group).forEach(([variantName, variant]) => {
    const base = resolveVariantBase(variantName);
    const responsive = variant.responsive.map(entry => {
      if (entry.target && entry.target !== variantName) {
        throw new Error(
          `Responsive recipe entry for ${options.groupPath}.${variantName} cannot target "${entry.target}".`,
        );
      }

      const inherited = entry.variant ? { ...resolveVariantBase(entry.variant) } : {};
      const overrides = interpretRecipeProps(
        entry as unknown as PaletteRecipeProps,
        tokens,
        `${options.groupPath}.${variantName}.responsive`,
      );

      return {
        ...inherited,
        ...overrides,
        breakpoint: entry.breakpoint,
        query: entry.query ?? "exact",
      } as RecipeResponsiveOverride<RecipeStyleBlock, TBreakpoint> & {
        query: "min" | "max" | "exact";
      };
    });

    interpreted[variantName] = { base, responsive } as PaletteRecipeVariantStyles<TBreakpoint>;
  });

  return interpreted;
};

const interpretRecipeProps = <TColor extends string>(
  props: PaletteRecipeProps | undefined,
  tokens: Record<TColor, PaletteTokens>,
  path: string,
): RecipeStyleBlock => {
  const styles: RecipeStyleBlock = {};
  if (!props) {
    return styles;
  }

  Object.entries(props).forEach(([property, value]) => {
    if (value === undefined || RESERVED_RECIPE_KEYS.has(property)) {
      return;
    }

    const resolved = resolvePaletteReference(value, tokens, path, property);
    if (resolved === undefined || resolved === "") {
      return;
    }

    styles[formatPropertyName(property)] = resolved;
  });

  return styles;
};

const resolvePaletteReference = <TColor extends string>(
  value: string | number,
  tokens: Record<TColor, PaletteTokens>,
  path: string,
  property: string,
): string | number => {
  if (typeof value === "number") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const segments = trimmed.split(".");
  const paletteName = segments[0] as TColor;
  const palette = tokens[paletteName];

  if (!palette) {
    return trimmed;
  }

  const variantKey = segments.length > 1 ? segments.slice(1).join(".") : undefined;

  if (!variantKey || variantKey === "main") {
    return palette.variants.main;
  }

  if (variantKey === "text") {
    return palette.text;
  }

  const resolved = palette.variants[variantKey];
  if (!resolved) {
    throw new Error(
      `Unknown palette variant reference "${String(paletteName)}.${variantKey}" in ${path}.${property}.`,
    );
  }

  return resolved;
};

const formatPropertyName = (property: string): string => {
  if (property.startsWith("--")) {
    return property;
  }

  return property
    .replace(/_/g, "-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
};
