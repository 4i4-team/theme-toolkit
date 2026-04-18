import { media } from "../../adapters/styled-components/media";
import type {
  ThemeWithMedia,
} from "../../adapters/styled-components/media";
import type { MediaConfig } from "../media";
import type { Breakpoints, CssNode, CssRuleNode, CssVariablesNode, NormalizedPropertyValue, NormalizedRecipeGroup } from "../common";
import {
  normalizePropertyValue,
  validateNormalizedResponsiveRefs,
  generateTokens,
  generateCssVariables,
  renderToCssString,
  normalizeCssVariablePrefix,
  expandResponsiveCssVariables,
  normalizeRecipeGroup,
  generateRecipeCss,
  assignRecipeClasses,
  createRecipeVariantResolver,
  sanitizeIdentifierSegment,
} from "../common";
import {
  buildMediaDescriptor,
  mediaQueryString,
  resolveMediaConfig as resolveCoreMediaConfig,
} from "../media";
import type { MediaDescriptor } from "../media";
import {
  createPaletteCssVariableResolver,
  createPaletteThemeHelper,
} from "../../subsystems/colors";
import type {
  PaletteBuilderOptions,
  PaletteSource,
  PaletteTokens,
  PaletteCollection,
  PaletteRecipeSource,
  PaletteRecipeStyleMap,
  NormalizedPaletteCollection,
  NormalizedPaletteValue,
  PalettePropertyExtras,
  PalettePropertyValue,
} from "../../subsystems/colors";
import {
  createTypographyCssVariableResolver,
  createTypographyThemeHelper,
  mapTypographyCssVariables,
} from "../../subsystems/typography";
import type { TypographySource, TypographyTokens, TypographyBuilderOptions, TypographyRecipeSource } from "../../subsystems/typography";
import {
  createLayoutThemeHelper,
  createLayoutCssVariableResolver,
  buildColumnsNodes,
  buildGridNodes,
  buildStackNodes,
  buildContainerNodes,
} from "../../subsystems/layout";
import type { LayoutSource, LayoutTokens as LayoutTokensType, LayoutBuilderOptions } from "../../subsystems/layout";
import type { MediaHelpers } from "../../adapters/styled-components/media";
import type { PropertyValue } from "../common";

type ColorsSubsystemSource<TPaletteKey extends string, TBreakpoint extends string> =
  Record<TPaletteKey, PaletteSource> & {
    recipes?: PaletteRecipeSource<TBreakpoint>;
  };

type ThemeWithBreakpoints<T extends string, TPaletteKey extends string> = {
  breakpoints: Breakpoints<T>;
  typography?: TypographySource;
  colors?: ColorsSubsystemSource<TPaletteKey, T>;
  layout?: LayoutSource;
};

type PaletteComputedProperties<TPaletteKey extends string, TBreakpoint extends string> = {
  readonly tokens: Record<TPaletteKey, PaletteTokens>;
  readonly variables: CssVariablesNode[];
  readonly nodes: CssNode[];
  readonly classes: Record<string, Record<string, string>>;
  readonly styles: Record<string, PaletteRecipeStyleMap<TBreakpoint>>;
  getClass: (group: string, variant: string) => string | undefined;
  lighten: (name: TPaletteKey, percent: number) => string;
  darken: (name: TPaletteKey, percent: number) => string;
  readonly recipes: PaletteRecipeSource<TBreakpoint>;
};

type PaletteThemeSlice<TPaletteKey extends string, TBreakpoint extends string> =
  Record<TPaletteKey, PaletteSource> & PaletteComputedProperties<TPaletteKey, TBreakpoint>;

type ThemeWithPalette<TPaletteKey extends string, TBreakpoint extends string> = {
  colors: PaletteThemeSlice<TPaletteKey, TBreakpoint>;
};

type ThemeWithAggregateCss = {
  readonly css: string;
  readonly nodes: CssNode[];
};

type TypographyComputedProperties = {
  readonly tokens: TypographyTokens;
  readonly variables: CssVariablesNode[];
  readonly nodes: CssNode[];
  readonly classes: Record<string, Record<string, string>>;
  getClass: (group: string, variant: string) => string | undefined;
  style: (group: string, variant: string) => Record<string, string>;
};

type TypographyThemeSlice = Record<string, unknown> & TypographyComputedProperties;

type ThemeWithTypography = {
  typography: TypographyThemeSlice;
};

type LayoutComputedProperties = {
  readonly tokens: LayoutTokensType;
  readonly variables: CssVariablesNode[];
  readonly nodes: CssNode[];
  readonly classes: Record<string, Record<string, string>>;
  getClass: (group: string, variant: string) => string | undefined;
};

type LayoutThemeSlice = Record<string, unknown> & LayoutComputedProperties;

type ThemeWithLayout = {
  layout: LayoutThemeSlice;
};

type PaletteRecipeOutput<TBreakpoint extends string> = {
  nodes: CssRuleNode[];
  classes: Record<string, Record<string, string>>;
  styles: Record<string, PaletteRecipeStyleMap<TBreakpoint>>;
};

type CreateThemeOptions = {
  media?: MediaConfig;
  palette?: PaletteBuilderOptions;
  typography?: { unit?: "px" | "rem"; prefix?: string };
  layout?: LayoutBuilderOptions;
};

const resolveMediaConfig = <T extends string, TPaletteKey extends string, TTheme extends ThemeWithBreakpoints<T, TPaletteKey>>(
  theme: TTheme,
  overrides?: MediaConfig,
): MediaConfig => ({
  unit: overrides?.unit,
  baseFontSize:
    overrides?.baseFontSize ??
    ((theme as any).typography?.source?.scale?.baseFontSize ??
      (theme as any).typography?.scale?.baseFontSize ??
      16),
});


export function createTheme<
  T extends string,
  TPaletteKey extends string,
  TTheme extends ThemeWithBreakpoints<T, TPaletteKey>,
>(
  theme: TTheme,
  options?: CreateThemeOptions,
): TTheme &
  ThemeWithMedia<T> &
  ThemeWithPalette<TPaletteKey, T> &
  ThemeWithTypography &
  ThemeWithLayout &
  ThemeWithAggregateCss {
  const paletteHelper = createPaletteThemeHelper();
  const clone = { ...theme } as TTheme &
    ThemeWithMedia<T> &
    ThemeWithBreakpoints<T, TPaletteKey> &
    ThemeWithPalette<TPaletteKey, T> &
    ThemeWithTypography &
    ThemeWithLayout &
    ThemeWithAggregateCss;

  const extractPaletteProperties = (
    source: ColorsSubsystemSource<TPaletteKey, T> | undefined,
  ): PaletteCollection<TPaletteKey> | undefined => {
    if (!source) return undefined;
    const { recipes: _recipes, ...properties } = source as Record<string, unknown>;
    return Object.keys(properties).length
      ? (properties as unknown as PaletteCollection<TPaletteKey>)
      : undefined;
  };

  const normalizePaletteCollection = (
    palette: PaletteCollection<TPaletteKey> | undefined,
    breakpoints: Breakpoints<T>,
  ): NormalizedPaletteCollection<TPaletteKey> => {
    if (!palette) {
      return {} as NormalizedPaletteCollection<TPaletteKey>;
    }

    const allowedBreakpoints = Object.keys(breakpoints) as string[];

    return Object.fromEntries(
      (Object.entries(palette) as Array<[TPaletteKey, PaletteSource]>).map(([name, raw]) => {
        const baseNormalized = normalizePropertyValue<string, PalettePropertyExtras, string>(
          raw as PalettePropertyValue,
          {
            propertyPath: `palette.${String(name)}`,
            allowedBreakpoints,
          },
        ) as any;

        const normalizedArgument = baseNormalized as unknown as NormalizedPropertyValue<any>;
        const finalized = (paletteHelper.normalizeProperty
          ? paletteHelper.normalizeProperty(name, raw, normalizedArgument)
          : baseNormalized) as unknown as NormalizedPaletteValue;

        validateNormalizedResponsiveRefs(finalized as any, {
          propertyPath: `colors.${String(name)}`,
        });

        return [name, finalized];
      }),
    ) as NormalizedPaletteCollection<TPaletteKey>;
  };

  const buildPaletteTokensFromNormalized = (
    normalized: NormalizedPaletteCollection<TPaletteKey>,
  ): Record<TPaletteKey, PaletteTokens> =>
    generateTokens(normalized, ({ name, value }) => {
      const variantEntries = value.variants
        ? Object.fromEntries(
            Object.entries(value.variants).map(([variant, definition]) => [
              variant,
              definition.base,
            ]),
          )
        : {};

      const baseToken: PaletteTokens = {
        text: value.text,
        variants: {
          main: value.base,
          ...variantEntries,
        },
      };

      const normalizedValue = value as NormalizedPaletteValue;
      const normalizedTokenArg = normalizedValue as unknown as NormalizedPropertyValue<any>;

      return paletteHelper.tokenizeProperty
        ? (paletteHelper.tokenizeProperty(
            name,
            normalizedTokenArg,
            baseToken,
          ) as PaletteTokens)
        : baseToken;
    });

  const buildPaletteBaseVariableNode = (
    tokens: Record<TPaletteKey, PaletteTokens>,
  ): CssVariablesNode[] => {
    if (!Object.keys(tokens).length) {
      return [];
    }

    const prefix = normalizeCssVariablePrefix(options?.palette?.prefix);
    const variables = paletteHelper.mapCssVariables
      ? paletteHelper.mapCssVariables(tokens, prefix)
      : generateCssVariables(tokens, { prefix });

    return [
      {
        kind: "variables",
        selector: ":root",
        variables,
      },
    ];
  };

  const buildPaletteResponsiveNodes = (
    normalized: NormalizedPaletteCollection<TPaletteKey>,
    mediaDescriptor: MediaDescriptor<T>,
  ): CssVariablesNode[] => {
    if (!Object.keys(normalized).length) {
      return [];
    }
    const prefix = normalizeCssVariablePrefix(options?.palette?.prefix);
    const resolveCssVariable = createPaletteCssVariableResolver(prefix);
    return expandResponsiveCssVariables(normalized, {
      resolveCssVariable,
      media: mediaDescriptor,
    });
  };

  const buildPaletteVariableNodes = (
    tokens: Record<TPaletteKey, PaletteTokens>,
    normalized: NormalizedPaletteCollection<TPaletteKey>,
    mediaDescriptor: MediaDescriptor<T>,
  ): CssVariablesNode[] => [
    ...buildPaletteBaseVariableNode(tokens),
    ...buildPaletteResponsiveNodes(normalized, mediaDescriptor),
  ];

  const buildMediaDescriptorInstance = (
    breakpoints: Breakpoints<T>,
    mediaOptions: MediaConfig,
  ): MediaDescriptor<T> => {
    const resolved = resolveCoreMediaConfig(mediaOptions);
    return buildMediaDescriptor(breakpoints, opts =>
      mediaQueryString(opts, resolved),
    );
  };

  let cachedBreakpoints = clone.breakpoints;
  let cachedMediaConfig = resolveMediaConfig(clone, options?.media);
  let cachedMedia = media(cachedBreakpoints, cachedMediaConfig);
  let cachedMediaDescriptor = buildMediaDescriptorInstance(cachedBreakpoints, cachedMediaConfig);
  let rawColorsSource: ColorsSubsystemSource<TPaletteKey, T> | undefined = clone.colors;
  let cachedColorsInput: ColorsSubsystemSource<TPaletteKey, T> | undefined = rawColorsSource;
  let cachedPaletteSource = extractPaletteProperties(cachedColorsInput);
  let cachedPaletteBreakpoints = clone.breakpoints;
  let cachedNormalizedPalette = normalizePaletteCollection(
    cachedPaletteSource,
    cachedPaletteBreakpoints,
  );
  let cachedPaletteTokens = buildPaletteTokensFromNormalized(cachedNormalizedPalette);
  let cachedPaletteVariables = buildPaletteVariableNodes(
    cachedPaletteTokens,
    cachedNormalizedPalette,
    cachedMediaDescriptor,
  );
  let cachedPaletteVariablesMedia = cachedMediaDescriptor;
  let cachedPaletteRecipesSource = cachedColorsInput?.recipes;
  let cachedPaletteRecipeTokens = cachedPaletteTokens;
  let cachedPaletteRecipeBreakpoints = cachedPaletteBreakpoints;
  let cachedPaletteRecipeMedia = cachedMediaDescriptor;
  const buildRecipeSelectorPrefix = (classPrefix: string | undefined, groupName: string): string => {
    const base = sanitizeIdentifierSegment(classPrefix ?? "dt-color") || "dt-color";
    const groupSegment = sanitizeIdentifierSegment(groupName);
    return groupSegment ? `${base}-${groupSegment}` : base;
  };

  const buildPaletteRecipesOutput = (
    recipeSource: PaletteRecipeSource<T> | undefined,
    tokens: Record<TPaletteKey, PaletteTokens>,
    breakpoints: Breakpoints<T>,
    mediaDescriptor: MediaDescriptor<T>,
  ): PaletteRecipeOutput<T> => {
    if (!recipeSource || !Object.keys(recipeSource).length || !paletteHelper.interpretRecipe) {
      return { nodes: [], classes: {}, styles: {} };
    }

    const prefix = normalizeCssVariablePrefix(options?.palette?.prefix);
    const resolveCssVariable = createPaletteCssVariableResolver(prefix);
    const allowedBreakpoints = Object.keys(breakpoints) as T[];
    const allNodes: CssRuleNode[] = [];
    const allClasses: Record<string, Record<string, string>> = {};
    const allStyles: Record<string, PaletteRecipeStyleMap<T>> = {};

    for (const [groupName, groupDef] of Object.entries(recipeSource) as [string, Record<string, unknown>][]) {
      const normalized = normalizeRecipeGroup(groupDef as any, {
        propertyPath: `colors.recipes.${groupName}`,
        allowedBreakpoints,
      });

      const groupPath = `colors.recipes.${groupName}`;
      const resolver = createRecipeVariantResolver(
        normalized,
        (variantName, variant, resolve) =>
          paletteHelper.interpretRecipe!(variantName, variant as any, {
            tokens,
            breakpoints,
            resolveCssVariable,
            resolveRecipeVariant: resolve as any,
            groupPath,
          }) as any,
        { groupPath },
      );

      const interpreted = resolver.resolveAll();
      allStyles[groupName] = interpreted as PaletteRecipeStyleMap<T>;

      const selectorPrefix = buildRecipeSelectorPrefix(options?.palette?.classPrefix, groupName);
      const { nodes, variants } = generateRecipeCss(interpreted as any, {
        media: mediaDescriptor,
        selectorBuilder: variantName =>
          `.${selectorPrefix}-${sanitizeIdentifierSegment(variantName)}`,
      });

      allNodes.push(...nodes);

      const classEntries = assignRecipeClasses(variants, { prefix: selectorPrefix });
      allClasses[groupName] = classEntries.reduce<Record<string, string>>((acc, entry) => {
        acc[entry.variant] = entry.className;
        return acc;
      }, {});
    }

    return { nodes: allNodes, classes: allClasses, styles: allStyles };
  };

  let cachedPaletteRecipes = buildPaletteRecipesOutput(
    cachedPaletteRecipesSource,
    cachedPaletteRecipeTokens,
    cachedPaletteRecipeBreakpoints,
    cachedPaletteRecipeMedia,
  );
  const syncPalette = () => {
    const currentColorsInput = rawColorsSource;
    const currentPalette = extractPaletteProperties(currentColorsInput);
    const currentBreakpoints = clone.breakpoints;

    if (
      currentColorsInput !== cachedColorsInput ||
      currentBreakpoints !== cachedPaletteBreakpoints
    ) {
      cachedColorsInput = currentColorsInput;
      cachedPaletteSource = currentPalette;
      cachedPaletteBreakpoints = currentBreakpoints;
      cachedNormalizedPalette = normalizePaletteCollection(
        currentPalette,
        currentBreakpoints,
      );
      cachedPaletteTokens = buildPaletteTokensFromNormalized(cachedNormalizedPalette);
      cachedPaletteRecipeTokens = cachedPaletteTokens;
      cachedPaletteVariables = buildPaletteVariableNodes(
        cachedPaletteTokens,
        cachedNormalizedPalette,
        cachedMediaDescriptor,
      );
      cachedPaletteVariablesMedia = cachedMediaDescriptor;
    }
  };

  const getPaletteTokens = () => {
    syncPalette();
    return cachedPaletteTokens;
  };

  const getPaletteVariables = () => {
    syncPalette();
    refreshMediaIfStale();
    if (cachedPaletteVariablesMedia !== cachedMediaDescriptor) {
      cachedPaletteVariables = buildPaletteVariableNodes(
        cachedPaletteTokens,
        cachedNormalizedPalette,
        cachedMediaDescriptor,
      );
      cachedPaletteVariablesMedia = cachedMediaDescriptor;
    }
    return cachedPaletteVariables;
  };
  const typographyHelper = createTypographyThemeHelper();
  const typographyOptions = options?.typography as TypographyBuilderOptions | undefined;
  let rawTypographySource = clone.typography as TypographySource | undefined;
  let cachedTypographySource = rawTypographySource;

  const extractTypographyProperties = (
    source: TypographySource | undefined,
  ): Record<string, unknown> | undefined => {
    if (!source) return undefined;
    const { recipes: _recipes, ...properties } = source;
    return Object.keys(properties).length ? properties : undefined;
  };

  const normalizeTypographyCollection = (
    source: TypographySource | undefined,
  ): Record<string, NormalizedPropertyValue<unknown>> => {
    if (!source) return {};
    const properties = extractTypographyProperties(source);
    if (!properties) return {};
    const allowedBreakpoints = Object.keys(clone.breakpoints) as string[];
    const result: Record<string, NormalizedPropertyValue<unknown>> = {};

    for (const [name, raw] of Object.entries(properties)) {
      const base = normalizePropertyValue(raw as any, {
        propertyPath: `typography.${name}`,
        allowedBreakpoints,
      });
      const finalized = typographyHelper.normalizeProperty
        ? typographyHelper.normalizeProperty(name, raw, base as any)
        : base;
      validateNormalizedResponsiveRefs(finalized as any, { propertyPath: `typography.${name}` });
      result[name] = finalized as NormalizedPropertyValue<unknown>;
    }
    return result;
  };

  let cachedNormalizedTypography = normalizeTypographyCollection(rawTypographySource);
  let cachedTypographyTokens: TypographyTokens = generateTokens(cachedNormalizedTypography, ({ name, value }) => {
    const baseToken = { base: (value as any).base, variants: {} };
    return typographyHelper.tokenizeProperty
      ? typographyHelper.tokenizeProperty(name, value as any, baseToken) as any
      : baseToken;
  });
  const typographyPrefix = normalizeCssVariablePrefix(typographyOptions?.prefix);
  let cachedTypographyVariables: CssVariablesNode[] = (() => {
    const variables = mapTypographyCssVariables(cachedTypographyTokens, typographyPrefix, {
      unit: typographyOptions?.unit,
      baseFontSize: (rawTypographySource?.fontSize as any)?.base,
    });
    const baseNode: CssVariablesNode[] = Object.keys(variables).length
      ? [{ kind: "variables" as const, selector: ":root", variables }]
      : [];
    const responsiveNodes = expandResponsiveCssVariables(cachedNormalizedTypography as any, {
      resolveCssVariable: createTypographyCssVariableResolver(typographyOptions?.prefix ?? ""),
      media: cachedMediaDescriptor,
    });
    return [...baseNode, ...responsiveNodes];
  })();

  let cachedTypographyRecipes: { nodes: CssRuleNode[]; classes: Record<string, Record<string, string>> } = (() => {
    const recipeSource = rawTypographySource?.recipes;
    if (!recipeSource || !Object.keys(recipeSource).length || !typographyHelper.interpretRecipe) {
      return { nodes: [], classes: {} };
    }
    const allowedBreakpoints = Object.keys(clone.breakpoints) as T[];
    const allNodes: CssRuleNode[] = [];
    const allClasses: Record<string, Record<string, string>> = {};
    for (const [groupName, groupDef] of Object.entries(recipeSource)) {
      const groupPath = `typography.recipes.${groupName}`;
      const normalized = normalizeRecipeGroup(groupDef as any, { propertyPath: groupPath, allowedBreakpoints });
      const resolver = createRecipeVariantResolver(
        normalized,
        (variantName, variant, resolve) =>
          typographyHelper.interpretRecipe!(variantName, variant as any, {
            tokens: cachedTypographyTokens,
            breakpoints: clone.breakpoints,
            resolveCssVariable: createTypographyCssVariableResolver(typographyOptions?.prefix ?? ""),
            resolveRecipeVariant: resolve as any,
            groupPath,
            options: typographyOptions,
          }) as any,
        { groupPath },
      );
      const interpreted = resolver.resolveAll();
      const classPrefix = sanitizeIdentifierSegment(typographyOptions?.prefix ?? "dt-type") || "dt-type";
      const selectorPrefix = `${classPrefix}-${sanitizeIdentifierSegment(groupName)}`;
      const { nodes, variants } = generateRecipeCss(interpreted as any, {
        media: cachedMediaDescriptor,
        selectorBuilder: variantName => `.${selectorPrefix}-${sanitizeIdentifierSegment(variantName)}`,
      });
      allNodes.push(...nodes);
      const classEntries = assignRecipeClasses(variants, { prefix: selectorPrefix });
      allClasses[groupName] = classEntries.reduce<Record<string, string>>((acc, entry) => {
        acc[entry.variant] = entry.className;
        return acc;
      }, {});
    }
    return { nodes: allNodes, classes: allClasses };
  })();

  const syncTypography = () => {
    if (rawTypographySource !== cachedTypographySource) {
      cachedTypographySource = rawTypographySource;
      cachedNormalizedTypography = normalizeTypographyCollection(rawTypographySource);
      cachedTypographyTokens = generateTokens(cachedNormalizedTypography, ({ name, value }) => {
        const baseToken = { base: (value as any).base, variants: {} };
        return typographyHelper.tokenizeProperty
          ? typographyHelper.tokenizeProperty(name, value as any, baseToken) as any
          : baseToken;
      });
      const variables = typographyHelper.mapCssVariables
        ? typographyHelper.mapCssVariables(cachedTypographyTokens, typographyPrefix)
        : generateCssVariables(cachedTypographyTokens, { prefix: typographyPrefix });
      const baseNode: CssVariablesNode[] = Object.keys(variables).length
        ? [{ kind: "variables" as const, selector: ":root", variables }]
        : [];
      const responsiveNodes = expandResponsiveCssVariables(cachedNormalizedTypography as any, {
        resolveCssVariable: createTypographyCssVariableResolver(typographyOptions?.prefix ?? ""),
        media: cachedMediaDescriptor,
      });
      cachedTypographyVariables = [...baseNode, ...responsiveNodes];
    }
  };
  const layoutHelper = createLayoutThemeHelper();
  const layoutOptions = options?.layout as LayoutBuilderOptions | undefined;
  let rawLayoutSource = clone.layout as LayoutSource | undefined;

  const LAYOUT_PROPERTY_KEYS = ["spacing", "gutters", "aspectRatio"];
  const LAYOUT_RESERVED_KEYS = new Set([...LAYOUT_PROPERTY_KEYS, "container", "columns", "grids", "stacks", "recipes"]);

  const extractLayoutProperties = (source: LayoutSource | undefined): Record<string, unknown> | undefined => {
    if (!source) return undefined;
    const props: Record<string, unknown> = {};
    for (const key of LAYOUT_PROPERTY_KEYS) {
      if ((source as any)[key] !== undefined) props[key] = (source as any)[key];
    }
    return Object.keys(props).length ? props : undefined;
  };

  const normalizeLayoutCollection = (source: LayoutSource | undefined) => {
    if (!source) return {};
    const properties = extractLayoutProperties(source);
    if (!properties) return {};
    const allowedBreakpoints = Object.keys(clone.breakpoints) as string[];
    const result: Record<string, NormalizedPropertyValue<unknown>> = {};
    for (const [name, raw] of Object.entries(properties)) {
      const base = normalizePropertyValue(raw as any, { propertyPath: `layout.${name}`, allowedBreakpoints });
      const finalized = layoutHelper.normalizeProperty ? layoutHelper.normalizeProperty(name, raw, base as any) : base;
      validateNormalizedResponsiveRefs(finalized as any, { propertyPath: `layout.${name}` });
      result[name] = finalized as NormalizedPropertyValue<unknown>;
    }
    return result;
  };

  let cachedNormalizedLayout = normalizeLayoutCollection(rawLayoutSource);
  let cachedLayoutTokens: LayoutTokensType = generateTokens(cachedNormalizedLayout, ({ name, value }) => {
    const baseToken = { base: (value as any).base, variants: {} };
    return layoutHelper.tokenizeProperty ? layoutHelper.tokenizeProperty(name, value as any, baseToken) as any : baseToken;
  });
  const layoutPrefix = normalizeCssVariablePrefix(layoutOptions?.prefix);
  const layoutClassPrefix = sanitizeIdentifierSegment(layoutOptions?.classPrefix ?? layoutOptions?.prefix ?? "dt") || "dt";

  let cachedLayoutVariables: CssVariablesNode[] = (() => {
    const variables = layoutHelper.mapCssVariables
      ? layoutHelper.mapCssVariables(cachedLayoutTokens, layoutPrefix)
      : generateCssVariables(cachedLayoutTokens, { prefix: layoutPrefix });
    const baseNode: CssVariablesNode[] = Object.keys(variables).length
      ? [{ kind: "variables" as const, selector: ":root", variables }]
      : [];
    const responsiveNodes = expandResponsiveCssVariables(cachedNormalizedLayout as any, {
      resolveCssVariable: createLayoutCssVariableResolver(layoutOptions?.prefix ?? ""),
      media: cachedMediaDescriptor,
      formatValue: (v: unknown) => typeof v === "number" ? `${v}px` : String(v ?? ""),
    });
    return [...baseNode, ...responsiveNodes];
  })();

  const buildLayoutSpecialNodes = (): { variables: CssVariablesNode[]; rules: CssRuleNode[] } => {
    const allVars: CssVariablesNode[] = [];
    const allRules: CssRuleNode[] = [];
    const spacingResolver = createLayoutCssVariableResolver(layoutOptions?.prefix ?? "");

    const mediaDesc = cachedMediaDescriptor as MediaDescriptor<string>;

    if (rawLayoutSource?.columns) {
      const { variables, rules } = buildColumnsNodes(
        rawLayoutSource.columns, layoutOptions?.prefix ?? "", layoutClassPrefix,
        clone.breakpoints, mediaDesc,
      );
      allVars.push(...variables);
      allRules.push(...rules);
    }

    allRules.push(...buildGridNodes(rawLayoutSource?.grids, layoutClassPrefix, mediaDesc, spacingResolver));
    allRules.push(...buildStackNodes(rawLayoutSource?.stacks, layoutClassPrefix, mediaDesc, spacingResolver));

    const { variables: containerVars, rules: containerRules } = buildContainerNodes(
      rawLayoutSource?.container as any, layoutOptions?.prefix ?? "", layoutClassPrefix,
      clone.breakpoints, mediaDesc, spacingResolver,
    );
    allVars.push(...containerVars);
    allRules.push(...containerRules);

    return { variables: allVars, rules: allRules };
  };

  let cachedLayoutSpecialNodes = buildLayoutSpecialNodes();

  let cachedLayoutRecipes: { nodes: CssRuleNode[]; classes: Record<string, Record<string, string>> } = (() => {
    const recipeSource = rawLayoutSource?.recipes;
    if (!recipeSource || !Object.keys(recipeSource).length || !layoutHelper.interpretRecipe) {
      return { nodes: [], classes: {} };
    }
    const allowedBreakpoints = Object.keys(clone.breakpoints) as T[];
    const allNodes: CssRuleNode[] = [];
    const allClasses: Record<string, Record<string, string>> = {};
    for (const [groupName, groupDef] of Object.entries(recipeSource)) {
      const groupPath = `layout.recipes.${groupName}`;
      const normalized = normalizeRecipeGroup(groupDef as any, { propertyPath: groupPath, allowedBreakpoints });
      const resolver = createRecipeVariantResolver(
        normalized,
        (variantName, variant, resolve) =>
          layoutHelper.interpretRecipe!(variantName, variant as any, {
            tokens: cachedLayoutTokens,
            breakpoints: clone.breakpoints,
            resolveCssVariable: createLayoutCssVariableResolver(layoutOptions?.prefix ?? ""),
            resolveRecipeVariant: resolve as any,
            groupPath,
            options: layoutOptions,
          }) as any,
        { groupPath },
      );
      const interpreted = resolver.resolveAll();
      const selectorPrefix = `${layoutClassPrefix}-${sanitizeIdentifierSegment(groupName)}`;
      const { nodes, variants } = generateRecipeCss(interpreted as any, {
        media: cachedMediaDescriptor,
        selectorBuilder: variantName => `.${selectorPrefix}-${sanitizeIdentifierSegment(variantName)}`,
      });
      allNodes.push(...nodes);
      const classEntries = assignRecipeClasses(variants, { prefix: selectorPrefix });
      allClasses[groupName] = classEntries.reduce<Record<string, string>>((acc, entry) => {
        acc[entry.variant] = entry.className;
        return acc;
      }, {});
    }
    return { nodes: allNodes, classes: allClasses };
  })();

  const syncLayout = () => {
    if (rawLayoutSource !== cachedTypographySource) {
      cachedNormalizedLayout = normalizeLayoutCollection(rawLayoutSource);
      cachedLayoutTokens = generateTokens(cachedNormalizedLayout, ({ name, value }) => {
        const baseToken = { base: (value as any).base, variants: {} };
        return layoutHelper.tokenizeProperty ? layoutHelper.tokenizeProperty(name, value as any, baseToken) as any : baseToken;
      });
      const variables = layoutHelper.mapCssVariables
        ? layoutHelper.mapCssVariables(cachedLayoutTokens, layoutPrefix)
        : generateCssVariables(cachedLayoutTokens, { prefix: layoutPrefix });
      const baseNode: CssVariablesNode[] = Object.keys(variables).length
        ? [{ kind: "variables" as const, selector: ":root", variables }]
        : [];
      const responsiveNodes = expandResponsiveCssVariables(cachedNormalizedLayout as any, {
        resolveCssVariable: createLayoutCssVariableResolver(layoutOptions?.prefix ?? ""),
        media: cachedMediaDescriptor,
        formatValue: (v: unknown) => typeof v === "number" ? `${v}px` : String(v ?? ""),
      });
      cachedLayoutVariables = [...baseNode, ...responsiveNodes];
      cachedLayoutSpecialNodes = buildLayoutSpecialNodes();
    }
  };

  const buildLayoutSlice = (): LayoutThemeSlice => {
    if (!rawLayoutSource) return {} as unknown as LayoutThemeSlice;
    const source = rawLayoutSource;
    const rawProps: Record<string, unknown> = {};
    for (const key of LAYOUT_RESERVED_KEYS) {
      if ((source as any)[key] !== undefined) rawProps[key] = (source as any)[key];
    }
    const slice = { ...rawProps } as LayoutThemeSlice;

    Object.defineProperty(slice, "tokens", {
      get: () => { syncLayout(); return cachedLayoutTokens; },
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "variables", {
      get: () => { syncLayout(); return [...cachedLayoutVariables, ...cachedLayoutSpecialNodes.variables]; },
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "nodes", {
      get: () => {
        syncLayout();
        return [
          ...cachedLayoutVariables,
          ...cachedLayoutSpecialNodes.variables,
          ...cachedLayoutSpecialNodes.rules,
          ...cachedLayoutRecipes.nodes,
        ];
      },
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "classes", {
      get: () => cachedLayoutRecipes.classes,
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "getClass", {
      get: () => (group: string, variant: string) => cachedLayoutRecipes.classes[group]?.[variant],
      enumerable: true, configurable: true,
    });

    return slice;
  };

  let cachedLayoutSlice = buildLayoutSlice();

  Object.defineProperty(clone, "layout", {
    get() { return cachedLayoutSlice; },
    set(value: LayoutSource | undefined) {
      rawLayoutSource = value;
      cachedLayoutSlice = buildLayoutSlice();
    },
    enumerable: true,
    configurable: true,
  });

  const refreshMediaIfStale = (): void => {
    const currentBreakpoints = clone.breakpoints;
    const currentConfig = resolveMediaConfig(clone, options?.media);
    const configChanged =
      currentConfig.unit !== cachedMediaConfig.unit ||
      currentConfig.baseFontSize !== cachedMediaConfig.baseFontSize;

    if (currentBreakpoints !== cachedBreakpoints || configChanged) {
      cachedBreakpoints = currentBreakpoints;
      cachedMediaConfig = currentConfig;
      cachedMedia = media(currentBreakpoints, currentConfig);
      cachedMediaDescriptor = buildMediaDescriptorInstance(currentBreakpoints, currentConfig);
    }
  };

  Object.defineProperty(clone, "media", {
    get() {
      refreshMediaIfStale();
      return cachedMedia;
    },
    enumerable: true,
    configurable: true,
  });

  const ensurePaletteRecipes = () => {
    syncPalette();
    refreshMediaIfStale();
    const tokens = getPaletteTokens();
    const recipesSource = cachedColorsInput?.recipes;
    const recipeBreakpoints = clone.breakpoints;

    if (
      recipesSource !== cachedPaletteRecipesSource ||
      tokens !== cachedPaletteRecipeTokens ||
      cachedMediaDescriptor !== cachedPaletteRecipeMedia ||
      recipeBreakpoints !== cachedPaletteRecipeBreakpoints
    ) {
      cachedPaletteRecipesSource = recipesSource;
      cachedPaletteRecipeTokens = tokens;
      cachedPaletteRecipeMedia = cachedMediaDescriptor;
      cachedPaletteRecipeBreakpoints = recipeBreakpoints;
      cachedPaletteRecipes = buildPaletteRecipesOutput(
        recipesSource,
        tokens,
        recipeBreakpoints,
        cachedMediaDescriptor,
      );
    }
  };

  const buildPaletteSliceExtras = () => {
    const tokens = getPaletteTokens();
    const variables = getPaletteVariables();
    ensurePaletteRecipes();
    return paletteHelper.buildSlice
      ? (paletteHelper.buildSlice({
          source: extractPaletteProperties(rawColorsSource),
          tokens,
          variableNodes: variables,
          recipes: {
            nodes: cachedPaletteRecipes.nodes,
            classes: cachedPaletteRecipes.classes,
          },
          options: options?.palette,
        }) as Record<string, unknown>)
      : {};
  };

  const buildColorsSlice = (): PaletteThemeSlice<TPaletteKey, T> => {
    const properties = extractPaletteProperties(rawColorsSource) ?? ({} as PaletteCollection<TPaletteKey>);
    const slice = { ...properties } as PaletteThemeSlice<TPaletteKey, T>;

    Object.defineProperty(slice, "tokens", {
      get: () => getPaletteTokens(),
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "variables", {
      get: () => getPaletteVariables(),
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "nodes", {
      get: () => [...getPaletteVariables(), ...(ensurePaletteRecipes(), cachedPaletteRecipes.nodes)],
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "classes", {
      get: () => { ensurePaletteRecipes(); return cachedPaletteRecipes.classes; },
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "styles", {
      get: () => { ensurePaletteRecipes(); return cachedPaletteRecipes.styles; },
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "getClass", {
      get: () => (group: string, variant: string) => {
        ensurePaletteRecipes();
        return cachedPaletteRecipes.classes[group]?.[variant];
      },
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "lighten", {
      get() {
        const extras = buildPaletteSliceExtras();
        return extras.lighten as (name: TPaletteKey, percent: number) => string;
      },
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "darken", {
      get() {
        const extras = buildPaletteSliceExtras();
        return extras.darken as (name: TPaletteKey, percent: number) => string;
      },
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "recipes", {
      value: rawColorsSource?.recipes ?? {},
      enumerable: true, configurable: true, writable: true,
    });

    return slice;
  };

  let cachedColorsSlice = buildColorsSlice();

  Object.defineProperty(clone, "colors", {
    get() {
      return cachedColorsSlice;
    },
    set(value: ColorsSubsystemSource<TPaletteKey, T> | undefined) {
      rawColorsSource = value;
      cachedColorsSlice = buildColorsSlice();
    },
    enumerable: true,
    configurable: true,
  });

  const buildTypographySlice = (): TypographyThemeSlice => {
    if (!rawTypographySource) {
      return {} as unknown as TypographyThemeSlice;
    }
    const properties = extractTypographyProperties(rawTypographySource) ?? {};
    const slice = { ...properties } as TypographyThemeSlice;

    Object.defineProperty(slice, "tokens", {
      get: () => { syncTypography(); return cachedTypographyTokens; },
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "variables", {
      get: () => { syncTypography(); return cachedTypographyVariables; },
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "nodes", {
      get: () => {
        syncTypography();
        return [...cachedTypographyVariables, ...cachedTypographyRecipes.nodes];
      },
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "classes", {
      get: () => cachedTypographyRecipes.classes,
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "getClass", {
      get: () => (group: string, variant: string) =>
        cachedTypographyRecipes.classes[group]?.[variant],
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "style", {
      get: () => {
        syncTypography();
        const extras = typographyHelper.buildSlice
          ? typographyHelper.buildSlice({
              source: extractTypographyProperties(rawTypographySource),
              tokens: cachedTypographyTokens,
              variableNodes: cachedTypographyVariables,
              recipes: { nodes: cachedTypographyRecipes.nodes, classes: cachedTypographyRecipes.classes },
              options: typographyOptions,
            }) as Record<string, unknown>
          : {};
        return (extras.style ?? (() => { throw new Error("Typography source is not defined."); })) as (g: string, v: string) => Record<string, string>;
      },
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "recipes", {
      value: rawTypographySource?.recipes ?? {},
      enumerable: true, configurable: true, writable: true,
    });

    return slice;
  };

  let cachedTypographySlice = buildTypographySlice();

  Object.defineProperty(clone, "typography", {
    get() {
      return cachedTypographySlice;
    },
    set(value: TypographySource | undefined) {
      rawTypographySource = value as TypographySource | undefined;
      cachedTypographySlice = buildTypographySlice();
    },
    enumerable: true,
    configurable: true,
  });

  const collectNodes = (): CssNode[] => {
    const nodes: CssNode[] = [];
    nodes.push(...getPaletteVariables());
    ensurePaletteRecipes();
    nodes.push(...cachedPaletteRecipes.nodes);
    syncTypography();
    nodes.push(...cachedTypographyVariables);
    nodes.push(...cachedTypographyRecipes.nodes);
    syncLayout();
    nodes.push(...cachedLayoutVariables);
    nodes.push(...cachedLayoutSpecialNodes.variables);
    nodes.push(...cachedLayoutSpecialNodes.rules);
    nodes.push(...cachedLayoutRecipes.nodes);
    return nodes;
  };

  Object.defineProperty(clone, "nodes", {
    get() {
      return collectNodes();
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "css", {
    get() {
      return renderToCssString(collectNodes());
    },
    enumerable: true,
    configurable: true,
  });

  return clone;
}
