import type { MediaConfig } from "../media";
import type { ThemeAdapter } from "./adapter";
import { createCssAdapter } from "./cssAdapter";
import type { Breakpoints, CssNode, CssRuleNode, CssVariablesNode, NormalizedPropertyValue, NormalizedRecipeGroup, RenderRecipeOptions } from "../common";
import {
  normalizePropertyValue,
  validateNormalizedResponsiveRefs,
  generateTokens,
  generateCssVariables,
  normalizeCssVariablePrefix,
  expandResponsiveCssVariables,
  normalizeRecipeGroup,
  generateRecipeCss,
  assignRecipeClasses,
  createRecipeVariantResolver,
  sanitizeIdentifierSegment,
  enrichDeclarationsWithRefs,
  renderRecipeNodes,
  renderVariablesCss,
  renderRulesCss,
  splitNodes,
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
import {
  createEffectsThemeHelper,
  createEffectsCssVariableResolver,
} from "../../subsystems/effects";
import type { EffectsSource, EffectsTokens as EffectsTokensType, EffectsBuilderOptions } from "../../subsystems/effects";
import {
  createComponentsThemeHelper,
  resolveComponentReferences,
} from "../../subsystems/components";
import type { ComponentsSource, ComponentsBuilderOptions, ResolvedComponentClass } from "../../subsystems/components";
import type { PropertyValue } from "../common";

type ColorsSubsystemSource<TBreakpoint extends string> = {
  [key: string]: PaletteSource | PaletteRecipeSource<TBreakpoint> | undefined;
} & {
  recipes?: PaletteRecipeSource<TBreakpoint>;
};

type ThemeWithBreakpoints<T extends string, TPaletteKey extends string> = {
  breakpoints: Breakpoints<T>;
  typography?: TypographySource;
  colors?: ColorsSubsystemSource<T>;
  layout?: LayoutSource;
  effects?: EffectsSource;
  components?: ComponentsSource;
};

type ThemeWithMedia<T extends string> = {
  readonly media: MediaDescriptor<T>;
};

// --- Recipe key extraction helpers ---

type ExtractRecipes<TSource, TKey extends string> =
  TSource extends Record<string, unknown>
    ? TKey extends keyof TSource
      ? TSource[TKey] extends Record<string, unknown>
        ? TSource[TKey] extends { recipes?: infer R }
          ? R extends Record<string, Record<string, unknown>> ? R : Record<string, Record<string, unknown>>
          : Record<string, Record<string, unknown>>
        : Record<string, Record<string, unknown>>
      : Record<string, Record<string, unknown>>
    : Record<string, Record<string, unknown>>;

type RecipeClassMap<TRecipes> = {
  readonly [G in keyof TRecipes & string]: {
    readonly [V in keyof TRecipes[G] & string]: string;
  };
};

type RecipeComponentClassMap<TRecipes> = {
  readonly [G in keyof TRecipes & string]: {
    readonly [V in keyof TRecipes[G] & string]: ResolvedComponentClass;
  };
};

type GetClassFn<TRecipes> = <G extends keyof TRecipes & string>(
  group: G,
  variant: keyof TRecipes[G] & string,
) => string | undefined;

// --- Subsystem slice types ---

type RenderRecipeFn<TRecipes> = {
  <G extends keyof TRecipes & string>(
    group: G,
    variant: keyof TRecipes[G] & string,
    options: RenderRecipeOptions & { inline: true },
  ): Record<string, string | number>;
  <G extends keyof TRecipes & string>(
    group: G,
    variant: keyof TRecipes[G] & string,
    options?: RenderRecipeOptions,
  ): string;
};

type PaletteComputedProperties<TPaletteKey extends string, TBreakpoint extends string, TRecipes = Record<string, Record<string, unknown>>> = {
  readonly tokens: Record<TPaletteKey, PaletteTokens>;
  readonly variables: CssVariablesNode[];
  readonly nodes: CssNode[];
  readonly classes: RecipeClassMap<TRecipes>;
  readonly styles: Record<string, PaletteRecipeStyleMap<TBreakpoint>>;
  getClass: GetClassFn<TRecipes>;
  renderRecipe: RenderRecipeFn<TRecipes>;
  lighten: (name: TPaletteKey, percent: number) => string;
  darken: (name: TPaletteKey, percent: number) => string;
  readonly recipes: PaletteRecipeSource<TBreakpoint>;
};

type PaletteThemeSlice<TPaletteKey extends string, TBreakpoint extends string, TRecipes = Record<string, Record<string, unknown>>> =
  Record<TPaletteKey, PaletteSource> & PaletteComputedProperties<TPaletteKey, TBreakpoint, TRecipes>;

type ThemeWithPalette<TPaletteKey extends string, TBreakpoint extends string, TRecipes = Record<string, Record<string, unknown>>> = {
  colors: PaletteThemeSlice<TPaletteKey, TBreakpoint, TRecipes>;
};

type ThemeWithAggregateCss = {
  readonly css: string;
  readonly variablesCss: string;
  readonly recipesCss: string;
  readonly nodes: CssNode[];
};

type TypographyComputedProperties<TRecipes = Record<string, Record<string, unknown>>> = {
  readonly tokens: TypographyTokens;
  readonly variables: CssVariablesNode[];
  readonly nodes: CssNode[];
  readonly classes: RecipeClassMap<TRecipes>;
  getClass: GetClassFn<TRecipes>;
  renderRecipe: RenderRecipeFn<TRecipes>;
  style: <G extends keyof TRecipes & string>(group: G, variant: keyof TRecipes[G] & string) => Record<string, string>;
};

type TypographyThemeSlice<TRecipes = Record<string, Record<string, unknown>>> = TypographySource & TypographyComputedProperties<TRecipes>;

type ThemeWithTypography<TRecipes = Record<string, Record<string, unknown>>> = {
  typography: TypographyThemeSlice<TRecipes>;
};

type LayoutComputedProperties<TRecipes = Record<string, Record<string, unknown>>> = {
  readonly tokens: LayoutTokensType;
  readonly variables: CssVariablesNode[];
  readonly nodes: CssNode[];
  readonly classes: RecipeClassMap<TRecipes>;
  getClass: GetClassFn<TRecipes>;
  renderRecipe: RenderRecipeFn<TRecipes>;
};

type LayoutThemeSlice<TRecipes = Record<string, Record<string, unknown>>> = LayoutSource & LayoutComputedProperties<TRecipes>;

type ThemeWithLayout<TRecipes = Record<string, Record<string, unknown>>> = {
  layout: LayoutThemeSlice<TRecipes>;
};

type EffectsComputedProperties<TRecipes = Record<string, Record<string, unknown>>> = {
  readonly tokens: EffectsTokensType;
  readonly variables: CssVariablesNode[];
  readonly nodes: CssNode[];
  readonly classes: RecipeClassMap<TRecipes>;
  getClass: GetClassFn<TRecipes>;
  renderRecipe: RenderRecipeFn<TRecipes>;
};

type EffectsThemeSlice<TRecipes = Record<string, Record<string, unknown>>> = EffectsSource & EffectsComputedProperties<TRecipes>;

type ThemeWithEffects<TRecipes = Record<string, Record<string, unknown>>> = {
  effects: EffectsThemeSlice<TRecipes>;
};

type ComponentsComputedProperties<TRecipes = Record<string, Record<string, unknown>>> = {
  readonly nodes: CssNode[];
  readonly classes: RecipeComponentClassMap<TRecipes>;
  getClass: <G extends keyof TRecipes & string>(group: G, variant: keyof TRecipes[G] & string) => string | undefined;
  renderRecipe: RenderRecipeFn<TRecipes>;
};

type ComponentsThemeSlice<TRecipes = Record<string, Record<string, unknown>>> = ComponentsSource & ComponentsComputedProperties<TRecipes>;

type ThemeWithComponents<TRecipes = Record<string, Record<string, unknown>>> = {
  components: ComponentsThemeSlice<TRecipes>;
};

type PaletteRecipeOutput<TBreakpoint extends string> = {
  nodes: CssRuleNode[];
  classes: Record<string, Record<string, string>>;
  styles: Record<string, PaletteRecipeStyleMap<TBreakpoint>>;
};

type CreateThemeOptions = {
  adapter?: ThemeAdapter;
  media?: MediaConfig;
  palette?: PaletteBuilderOptions;
  typography?: { unit?: "px" | "rem"; prefix?: string };
  layout?: LayoutBuilderOptions;
  effects?: EffectsBuilderOptions;
  components?: ComponentsBuilderOptions;
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
  ThemeWithPalette<TPaletteKey, T, ExtractRecipes<TTheme, "colors">> &
  ThemeWithTypography<ExtractRecipes<TTheme, "typography">> &
  ThemeWithLayout<ExtractRecipes<TTheme, "layout">> &
  ThemeWithEffects<ExtractRecipes<TTheme, "effects">> &
  ThemeWithComponents<ExtractRecipes<TTheme, "components">> &
  ThemeWithAggregateCss {
  const adapter = options?.adapter ?? createCssAdapter();
  const adapterRenderRecipe = (
    rules: CssRuleNode[],
    variables: CssVariablesNode[],
    renderOptions?: RenderRecipeOptions,
  ): string | Record<string, string | number> =>
    adapter.renderRecipe
      ? adapter.renderRecipe(rules, variables, renderOptions)
      : renderRecipeNodes(rules, variables, renderOptions as any);

  const paletteHelper = createPaletteThemeHelper();
  const clone = { ...theme } as TTheme &
    ThemeWithMedia<T> &
    ThemeWithBreakpoints<T, TPaletteKey> &
    ThemeWithPalette<TPaletteKey, T> &
    ThemeWithTypography &
    ThemeWithLayout &
    ThemeWithEffects &
    ThemeWithAggregateCss;

  const extractPaletteProperties = (
    source: ColorsSubsystemSource<T> | undefined,
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
  let cachedMediaDescriptor = buildMediaDescriptorInstance(cachedBreakpoints, cachedMediaConfig);
  let cachedMedia = adapter.wrapMedia(cachedMediaDescriptor);
  let rawColorsSource: ColorsSubsystemSource<T> | undefined = clone.colors;
  let cachedColorsInput: ColorsSubsystemSource<T> | undefined = rawColorsSource;
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
            resolveVariableReference: adapter.resolveVariableReference,
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
            resolveVariableReference: adapter.resolveVariableReference,
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
        clone.breakpoints, mediaDesc, adapter.resolveVariableReference,
      );
      allVars.push(...variables);
      allRules.push(...rules);
    }

    allRules.push(...buildGridNodes(rawLayoutSource?.grids, layoutClassPrefix, mediaDesc, spacingResolver, adapter.resolveVariableReference));
    allRules.push(...buildStackNodes(rawLayoutSource?.stacks, layoutClassPrefix, mediaDesc, spacingResolver, adapter.resolveVariableReference));

    const { variables: containerVars, rules: containerRules } = buildContainerNodes(
      rawLayoutSource?.container as any, layoutOptions?.prefix ?? "", layoutClassPrefix,
      clone.breakpoints, mediaDesc, spacingResolver, adapter.resolveVariableReference,
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
            resolveVariableReference: adapter.resolveVariableReference,
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
    Object.defineProperty(slice, "renderRecipe", {
      get: () => (group: string, variant: string, renderOptions?: RenderRecipeOptions) => {
        syncLayout();
        const className = cachedLayoutRecipes.classes[group]?.[variant];
        if (!className) return "";
        const selector = `.${className}`;
        const rules = cachedLayoutRecipes.nodes.filter(n => n.selector === selector);
        const allVars = [...cachedLayoutVariables, ...cachedLayoutSpecialNodes.variables];
        enrichDeclarationsWithRefs([...allVars, ...rules]);
        return adapterRenderRecipe(rules, allVars as CssVariablesNode[], renderOptions);
      },
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
      cachedMediaDescriptor = buildMediaDescriptorInstance(currentBreakpoints, currentConfig);
      cachedMedia = adapter.wrapMedia(cachedMediaDescriptor);
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
    Object.defineProperty(slice, "renderRecipe", {
      get: () => (group: string, variant: string, renderOptions?: RenderRecipeOptions) => {
        ensurePaletteRecipes();
        const className = cachedPaletteRecipes.classes[group]?.[variant];
        if (!className) return "";
        const selector = `.${className}`;
        const rules = cachedPaletteRecipes.nodes.filter(n => n.selector === selector);
        enrichDeclarationsWithRefs([...getPaletteVariables(), ...rules]);
        return adapterRenderRecipe(rules, getPaletteVariables() as CssVariablesNode[], renderOptions);
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
    set(value: ColorsSubsystemSource<T> | undefined) {
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
    Object.defineProperty(slice, "renderRecipe", {
      get: () => (group: string, variant: string, renderOptions?: RenderRecipeOptions) => {
        syncTypography();
        const className = cachedTypographyRecipes.classes[group]?.[variant];
        if (!className) return "";
        const selector = `.${className}`;
        const rules = cachedTypographyRecipes.nodes.filter(n => n.selector === selector);
        enrichDeclarationsWithRefs([...cachedTypographyVariables, ...rules]);
        return adapterRenderRecipe(rules, cachedTypographyVariables as CssVariablesNode[], renderOptions);
      },
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "style", {
      get: () => {
        syncTypography();
        const extras = typographyHelper.buildSlice
          ? typographyHelper.buildSlice({
              source: rawTypographySource,
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

  // --- Effects subsystem ---
  const effectsHelper = createEffectsThemeHelper();
  const effectsOptions = options?.effects as EffectsBuilderOptions | undefined;
  let rawEffectsSource = clone.effects as EffectsSource | undefined;

  const EFFECTS_PROPERTY_KEYS = ["radius", "shadow", "blur", "zIndex", "opacity", "outline", "borderWidth", "transitions"];
  const EFFECTS_RESERVED_KEYS = new Set([...EFFECTS_PROPERTY_KEYS, "recipes"]);

  const extractEffectsProperties = (source: EffectsSource | undefined): Record<string, unknown> | undefined => {
    if (!source) return undefined;
    const props: Record<string, unknown> = {};
    for (const key of EFFECTS_PROPERTY_KEYS) {
      if ((source as any)[key] !== undefined) props[key] = (source as any)[key];
    }
    return Object.keys(props).length ? props : undefined;
  };

  const normalizeEffectsCollection = (source: EffectsSource | undefined) => {
    if (!source) return {};
    const properties = extractEffectsProperties(source);
    if (!properties) return {};
    const allowedBreakpoints = Object.keys(clone.breakpoints) as string[];
    const result: Record<string, NormalizedPropertyValue<unknown>> = {};
    for (const [name, raw] of Object.entries(properties)) {
      const base = normalizePropertyValue(raw as any, { propertyPath: `effects.${name}`, allowedBreakpoints });
      validateNormalizedResponsiveRefs(base as any, { propertyPath: `effects.${name}` });
      result[name] = base as NormalizedPropertyValue<unknown>;
    }
    return result;
  };

  let cachedNormalizedEffects = normalizeEffectsCollection(rawEffectsSource);
  let cachedEffectsTokens: EffectsTokensType = generateTokens(cachedNormalizedEffects, ({ name, value }) => {
    const baseToken = { base: (value as any).base, variants: {} };
    return effectsHelper.tokenizeProperty
      ? effectsHelper.tokenizeProperty(name, value as any, baseToken) as any
      : baseToken;
  });
  const effectsPrefix = normalizeCssVariablePrefix(effectsOptions?.prefix);
  let cachedEffectsVariables: CssVariablesNode[] = (() => {
    const variables = effectsHelper.mapCssVariables
      ? effectsHelper.mapCssVariables(cachedEffectsTokens, effectsPrefix)
      : generateCssVariables(cachedEffectsTokens, { prefix: effectsPrefix });
    const baseNode: CssVariablesNode[] = Object.keys(variables).length
      ? [{ kind: "variables" as const, selector: ":root", variables }]
      : [];
    const responsiveNodes = expandResponsiveCssVariables(cachedNormalizedEffects as any, {
      resolveCssVariable: createEffectsCssVariableResolver(effectsOptions?.prefix ?? ""),
      media: cachedMediaDescriptor,
      formatValue: (v: unknown) => typeof v === "number" ? `${v}px` : String(v ?? ""),
    });
    return [...baseNode, ...responsiveNodes];
  })();

  let cachedEffectsRecipes: { nodes: CssRuleNode[]; classes: Record<string, Record<string, string>> } = (() => {
    const recipeSource = rawEffectsSource?.recipes;
    if (!recipeSource || !Object.keys(recipeSource).length || !effectsHelper.interpretRecipe) {
      return { nodes: [], classes: {} };
    }
    const allowedBreakpoints = Object.keys(clone.breakpoints) as T[];
    const allNodes: CssRuleNode[] = [];
    const allClasses: Record<string, Record<string, string>> = {};
    const effectsClassPrefix = sanitizeIdentifierSegment(effectsOptions?.classPrefix ?? effectsOptions?.prefix ?? "dt-fx") || "dt-fx";
    for (const [groupName, groupDef] of Object.entries(recipeSource)) {
      const groupPath = `effects.recipes.${groupName}`;
      const normalized = normalizeRecipeGroup(groupDef as any, { propertyPath: groupPath, allowedBreakpoints });
      const resolver = createRecipeVariantResolver(
        normalized,
        (variantName, variant, resolve) =>
          effectsHelper.interpretRecipe!(variantName, variant as any, {
            tokens: cachedEffectsTokens,
            breakpoints: clone.breakpoints,
            resolveCssVariable: createEffectsCssVariableResolver(effectsOptions?.prefix ?? ""),
            resolveVariableReference: adapter.resolveVariableReference,
            resolveRecipeVariant: resolve as any,
            groupPath,
            options: effectsOptions,
          }) as any,
        { groupPath },
      );
      const interpreted = resolver.resolveAll();
      const selectorPrefix = `${effectsClassPrefix}-${sanitizeIdentifierSegment(groupName)}`;
      const { nodes, variants } = generateRecipeCss(interpreted as any, {
        media: cachedMediaDescriptor as MediaDescriptor<string>,
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

  const buildEffectsSlice = (): EffectsThemeSlice => {
    if (!rawEffectsSource) return {} as unknown as EffectsThemeSlice;
    const rawProps: Record<string, unknown> = {};
    for (const key of EFFECTS_RESERVED_KEYS) {
      if ((rawEffectsSource as any)[key] !== undefined) rawProps[key] = (rawEffectsSource as any)[key];
    }
    const slice = { ...rawProps } as EffectsThemeSlice;

    Object.defineProperty(slice, "tokens", {
      get: () => cachedEffectsTokens,
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "variables", {
      get: () => cachedEffectsVariables,
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "nodes", {
      get: () => [...cachedEffectsVariables, ...cachedEffectsRecipes.nodes],
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "classes", {
      get: () => cachedEffectsRecipes.classes,
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "getClass", {
      get: () => (group: string, variant: string) => cachedEffectsRecipes.classes[group]?.[variant],
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "renderRecipe", {
      get: () => (group: string, variant: string, renderOptions?: RenderRecipeOptions) => {
        const className = cachedEffectsRecipes.classes[group]?.[variant];
        if (!className) return "";
        const selector = `.${className}`;
        const rules = cachedEffectsRecipes.nodes.filter(n => n.selector === selector);
        enrichDeclarationsWithRefs([...cachedEffectsVariables, ...rules]);
        return adapterRenderRecipe(rules, cachedEffectsVariables as CssVariablesNode[], renderOptions);
      },
      enumerable: true, configurable: true,
    });

    return slice;
  };

  let cachedEffectsSlice = buildEffectsSlice();

  Object.defineProperty(clone, "effects", {
    get() { return cachedEffectsSlice; },
    set(value: EffectsSource | undefined) {
      rawEffectsSource = value;
      cachedEffectsSlice = buildEffectsSlice();
    },
    enumerable: true,
    configurable: true,
  });

  // --- Components (composition) subsystem ---
  const componentsHelper = createComponentsThemeHelper();
  const componentsOptions = options?.components as ComponentsBuilderOptions | undefined;
  const rawComponentsSource = clone.components as ComponentsSource | undefined;
  const componentsClassPrefix = sanitizeIdentifierSegment(componentsOptions?.classPrefix ?? componentsOptions?.prefix ?? "dt-comp") || "dt-comp";

  const getSubsystemRecipeClass = (subsystem: string, group: string, variant: string): string | undefined => {
    switch (subsystem) {
      case "colors": { ensurePaletteRecipes(); return cachedPaletteRecipes.classes[group]?.[variant]; }
      case "typography": return cachedTypographyRecipes.classes[group]?.[variant];
      case "layout": return cachedLayoutRecipes.classes[group]?.[variant];
      case "effects": return cachedEffectsRecipes.classes[group]?.[variant];
      default: return undefined;
    }
  };

  const buildComponentsOutput = (): {
    nodes: CssRuleNode[];
    classes: Record<string, Record<string, ResolvedComponentClass>>;
  } => {
    const recipeSource = rawComponentsSource?.recipes;
    if (!recipeSource || !Object.keys(recipeSource).length || !componentsHelper.interpretRecipe) {
      return { nodes: [], classes: {} };
    }
    const allowedBreakpoints = Object.keys(clone.breakpoints) as T[];
    const allNodes: CssRuleNode[] = [];
    const allClasses: Record<string, Record<string, ResolvedComponentClass>> = {};

    for (const [groupName, groupDef] of Object.entries(recipeSource)) {
      const groupPath = `components.recipes.${groupName}`;
      const normalized = normalizeRecipeGroup(groupDef as any, { propertyPath: groupPath, allowedBreakpoints });
      const resolver = createRecipeVariantResolver(
        normalized,
        (variantName, variant, resolve) =>
          componentsHelper.interpretRecipe!(variantName, variant as any, {
            tokens: {},
            breakpoints: clone.breakpoints,
            resolveCssVariable: (() => "") as any,
            resolveVariableReference: adapter.resolveVariableReference,
            resolveRecipeVariant: resolve as any,
            groupPath,
            options: componentsOptions,
          }) as any,
        { groupPath },
      );

      const interpreted = resolver.resolveAll();
      const selectorPrefix = `${componentsClassPrefix}-${sanitizeIdentifierSegment(groupName)}`;
      const { nodes, variants } = generateRecipeCss(interpreted as any, {
        media: cachedMediaDescriptor as MediaDescriptor<string>,
        selectorBuilder: variantName => `.${selectorPrefix}-${sanitizeIdentifierSegment(variantName)}`,
      });
      allNodes.push(...nodes);

      const classEntries = assignRecipeClasses(variants, { prefix: selectorPrefix });
      allClasses[groupName] = {};

      for (const entry of classEntries) {
        const rawVariant = (groupDef as Record<string, Record<string, unknown>>)[entry.variant];
        const referenced = rawVariant
          ? resolveComponentReferences(rawVariant, getSubsystemRecipeClass)
          : [];
        const classes = [...referenced, entry.className];
        allClasses[groupName][entry.variant] = {
          classes,
          className: classes.join(" "),
        };
      }
    }

    return { nodes: allNodes, classes: allClasses };
  };

  const cachedComponentsOutput = buildComponentsOutput();

  const buildComponentsSlice = (): ComponentsThemeSlice => {
    if (!rawComponentsSource) return {} as unknown as ComponentsThemeSlice;
    const slice = { recipes: rawComponentsSource.recipes ?? {} } as unknown as ComponentsThemeSlice;

    Object.defineProperty(slice, "nodes", {
      get: () => cachedComponentsOutput.nodes,
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "classes", {
      get: () => cachedComponentsOutput.classes,
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "getClass", {
      get: () => (group: string, variant: string) =>
        cachedComponentsOutput.classes[group]?.[variant]?.className,
      enumerable: true, configurable: true,
    });
    Object.defineProperty(slice, "renderRecipe", {
      get: () => (group: string, variant: string, renderOptions?: RenderRecipeOptions) => {
        const allNodes = collectNodes();
        const allVars = splitNodes(allNodes).variables;
        // Collect all rule nodes for this component variant + referenced subsystem recipes
        const compData = cachedComponentsOutput.classes[group]?.[variant];
        if (!compData) return "";
        const classNames = compData.classes;
        const rules = allNodes.filter(
          (n): n is CssRuleNode => n.kind === "rule" && classNames.some(cls => n.selector === `.${cls}`),
        );
        enrichDeclarationsWithRefs([...allVars, ...rules]);
        return adapterRenderRecipe(rules, allVars, renderOptions);
      },
      enumerable: true, configurable: true,
    });

    return slice;
  };

  Object.defineProperty(clone, "components", {
    value: buildComponentsSlice(),
    enumerable: true, configurable: true, writable: true,
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
    nodes.push(...cachedEffectsVariables);
    nodes.push(...cachedEffectsRecipes.nodes);
    nodes.push(...cachedComponentsOutput.nodes);
    enrichDeclarationsWithRefs(nodes);
    return nodes;
  };

  const collectVariableNodes = (): CssVariablesNode[] => {
    const nodes = collectNodes();
    return splitNodes(nodes).variables;
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
      return adapter.renderCss(collectNodes());
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "variablesCss", {
    get() {
      return renderVariablesCss(collectNodes());
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "recipesCss", {
    get() {
      return renderRulesCss(collectNodes());
    },
    enumerable: true,
    configurable: true,
  });

  if (adapter.extend) {
    const extras = adapter.extend(clone as Record<string, unknown>);
    for (const [key, value] of Object.entries(extras)) {
      Object.defineProperty(clone, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
  }

  return clone as unknown as TTheme &
    ThemeWithMedia<T> &
    ThemeWithPalette<TPaletteKey, T, ExtractRecipes<TTheme, "colors">> &
    ThemeWithTypography<ExtractRecipes<TTheme, "typography">> &
    ThemeWithLayout<ExtractRecipes<TTheme, "layout">> &
    ThemeWithEffects<ExtractRecipes<TTheme, "effects">> &
    ThemeWithComponents<ExtractRecipes<TTheme, "components">> &
    ThemeWithAggregateCss;
}
