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
  buildTypographyTokens,
  buildTypographyVariableNodes,
  createTypographyStyle,
  createTypographyThemeHelper,
} from "../../subsystems/typography";
import type { TypographySource, TypographyTokens, TypographyBuilderOptions, TypographyStyles } from "../../subsystems/typography";
import { buildGridTokens } from "../../subsystems/layout";
import type {
  LayoutConfig,
  LayoutTokens,
  LayoutHelpers,
  LayoutBuilderOptions,
} from "../../subsystems/layout";
import type { MediaHelpers } from "../../adapters/styled-components/media";

type ColorsSubsystemSource<TPaletteKey extends string, TBreakpoint extends string> =
  Record<TPaletteKey, PaletteSource> & {
    recipes?: PaletteRecipeSource<TBreakpoint>;
  };

type ThemeWithBreakpoints<T extends string, TPaletteKey extends string> = {
  breakpoints: Breakpoints<T>;
  typography?: TypographySource;
  colors?: ColorsSubsystemSource<TPaletteKey, T>;
  layout?: LayoutConfig<T>;
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
  readonly tokens?: TypographyTokens;
  readonly variables: CssVariablesNode[];
  readonly nodes: CssNode[];
  readonly classes: Record<string, Record<string, string>>;
  getClass: (group: string, variant: string) => string | undefined;
  style: (group: string, variant: string) => Record<string, string | number>;
};

type TypographyThemeSlice = TypographySource & TypographyComputedProperties;

type ThemeWithTypography = {
  typography: TypographyThemeSlice;
};

type ThemeWithLayout<T extends string> = {
  layoutTokens?: LayoutTokens<T>;
  layoutCSS: string;
  layoutSpacing: LayoutHelpers<T>["spacing"];
  layoutGutter: LayoutHelpers<T>["gutter"];
  layoutColumns: LayoutHelpers<T>["buildColumns"];
  layoutContainer: LayoutHelpers<T>["buildContainer"];
  layoutStyle: LayoutHelpers<T>["layout"];
  layoutStack: LayoutHelpers<T>["stack"];
  layoutGrid: LayoutHelpers<T>["grid"];
  layoutClassPrefix: string;
  layoutColumnsMixin: () => unknown;
  layoutContainerMixin: (name: string) => unknown;
  layoutStyleMixin: (group: string, variant: string) => unknown;
  layoutStackMixin: (name: string) => unknown;
  layoutGridMixin: (name: string) => unknown;
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

const createMissingLayoutHelpers = <T extends string>(): ThemeWithLayout<T> => {
  const error = () => {
    throw new Error("Layout source is not defined.");
  };

  return {
    layoutTokens: undefined,
    layoutCSS: "",
    layoutSpacing: () => error(),
    layoutGutter: () => error(),
    layoutColumns: () => error(),
    layoutContainer: () => error(),
    layoutStyle: () => error(),
    layoutStack: () => error(),
    layoutGrid: () => error(),
    layoutClassPrefix: "dt",
    layoutColumnsMixin: () => error(),
    layoutContainerMixin: () => error(),
    layoutStyleMixin: () => error(),
    layoutStackMixin: () => error(),
    layoutGridMixin: () => error(),
  };
};

const buildLayoutHelpers = <T extends string>(
  layout: LayoutConfig<T> | undefined,
  breakpoints: Breakpoints<T>,
  options?: LayoutBuilderOptions,
): ThemeWithLayout<T> => {
  if (!layout) {
    return createMissingLayoutHelpers();
  }

  const { tokens, helpers, toCSS } = buildGridTokens({ layout }, breakpoints, options);

  return {
    layoutTokens: tokens,
    layoutCSS: toCSS(),
    layoutSpacing: helpers.spacing,
    layoutGutter: helpers.gutter,
    layoutColumns: helpers.buildColumns,
    layoutContainer: helpers.buildContainer,
    layoutStyle: helpers.layout,
    layoutStack: helpers.stack,
    layoutGrid: helpers.grid,
    layoutClassPrefix: helpers.classPrefix,
    layoutColumnsMixin: () => helpers.columnsMixin(),
    layoutContainerMixin: (name: string) => {
      const mixin = helpers.containerMixin(name);
      if (!mixin) {
        throw new Error(`Layout container "${name}" is not defined.`);
      }
      return mixin;
    },
    layoutStyleMixin: (group: string, variant: string) => {
      const mixin = helpers.styleMixin(group, variant);
      if (!mixin) {
        throw new Error(`Layout style "${group}.${variant}" is not defined.`);
      }
      return mixin;
    },
    layoutStackMixin: (name: string) => {
      const mixin = helpers.stackMixin(name);
      if (!mixin) {
        throw new Error(`Layout stack "${name}" is not defined.`);
      }
      return mixin;
    },
    layoutGridMixin: (name: string) => {
      const mixin = helpers.gridMixin(name);
      if (!mixin) {
        throw new Error(`Layout grid "${name}" is not defined.`);
      }
      return mixin;
    },
  };
};

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
  ThemeWithLayout<T> &
  ThemeWithAggregateCss {
  const paletteHelper = createPaletteThemeHelper();
  const clone = { ...theme } as TTheme &
    ThemeWithMedia<T> &
    ThemeWithBreakpoints<T, TPaletteKey> &
    ThemeWithPalette<TPaletteKey, T> &
    ThemeWithTypography &
    ThemeWithLayout<T> &
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
  let rawTypographySource = clone.typography as TypographySource | undefined;
  let cachedTypographySource = rawTypographySource;
  let cachedTypographyTokens: TypographyTokens | undefined = rawTypographySource
    ? buildTypographyTokens(rawTypographySource, { unit: (options?.typography as TypographyBuilderOptions)?.unit ?? "px" })
    : undefined;
  let cachedTypographyVariables: CssVariablesNode[] = cachedTypographyTokens
    ? buildTypographyVariableNodes(cachedTypographyTokens, (options?.typography as TypographyBuilderOptions)?.prefix)
    : [];
  const syncTypography = () => {
    if (rawTypographySource !== cachedTypographySource) {
      cachedTypographySource = rawTypographySource;
      cachedTypographyTokens = rawTypographySource
        ? buildTypographyTokens(rawTypographySource, { unit: (options?.typography as TypographyBuilderOptions)?.unit ?? "px" })
        : undefined;
      cachedTypographyVariables = cachedTypographyTokens
        ? buildTypographyVariableNodes(cachedTypographyTokens, (options?.typography as TypographyBuilderOptions)?.prefix)
        : [];
    }
  };
  let cachedLayoutSource = clone.layout;
  let cachedLayoutBreakpoints = cachedBreakpoints;
  let cachedLayout = buildLayoutHelpers(
    cachedLayoutSource,
    cachedLayoutBreakpoints,
    options?.layout,
  );

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

  const typographyHelper = createTypographyThemeHelper();

  const buildTypographyRecipes = (): {
    nodes: CssRuleNode[];
    classes: Record<string, Record<string, string>>;
  } => {
    const styleSource = rawTypographySource?.recipes;
    if (!styleSource || !Object.keys(styleSource).length || !typographyHelper.interpretRecipe) {
      return { nodes: [], classes: {} };
    }

    const allowedBreakpoints = Object.keys(clone.breakpoints) as T[];
    const typographyOptions = options?.typography as TypographyBuilderOptions | undefined;
    const allNodes: CssRuleNode[] = [];
    const allClasses: Record<string, Record<string, string>> = {};

    for (const [groupName, groupDef] of Object.entries(styleSource)) {
      const groupPath = `typography.recipes.${groupName}`;
      const normalized = normalizeRecipeGroup(groupDef as any, {
        propertyPath: groupPath,
        allowedBreakpoints,
      });

      const resolver = createRecipeVariantResolver(
        normalized,
        (variantName, variant, resolve) =>
          typographyHelper.interpretRecipe!(variantName, variant as any, {
            tokens: cachedTypographyTokens,
            breakpoints: clone.breakpoints,
            resolveCssVariable: (() => "") as any,
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

    return { nodes: allNodes, classes: allClasses };
  };

  let cachedTypographyRecipes = buildTypographyRecipes();

  const buildTypographySlice = (): TypographyThemeSlice => {
    if (!rawTypographySource) {
      return { families: {} as any, weights: {} as any, lineHeights: {} as any, letterSpacings: {} as any, scale: {} as any } as unknown as TypographyThemeSlice;
    }
    const source = rawTypographySource;
    const slice = { ...source } as TypographyThemeSlice;

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
      get: () => (group: string, variant: string) => {
        syncTypography();
        if (!cachedTypographyTokens) throw new Error("Typography source is not defined.");
        return createTypographyStyle(cachedTypographyTokens, rawTypographySource?.recipes, group, variant);
      },
      enumerable: true, configurable: true,
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

  const ensureLayout = () => {
    const currentLayout = clone.layout;
    const currentBreakpoints = clone.breakpoints;

    if (
      currentLayout !== cachedLayoutSource ||
      currentBreakpoints !== cachedLayoutBreakpoints
    ) {
      cachedLayoutSource = currentLayout;
      cachedLayoutBreakpoints = currentBreakpoints;
      cachedLayout = buildLayoutHelpers(
        cachedLayoutSource,
        cachedLayoutBreakpoints,
        options?.layout,
      );
    }
  };

  Object.defineProperty(clone, "layoutTokens", {
    get() {
      ensureLayout();
      return cachedLayout.layoutTokens;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutCSS", {
    get() {
      ensureLayout();
      return cachedLayout.layoutCSS;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutSpacing", {
    value: (token: string) => {
      ensureLayout();
      return cachedLayout.layoutSpacing(token);
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutGutter", {
    value: (token: string) => {
      ensureLayout();
      return cachedLayout.layoutGutter(token);
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutColumns", {
    value: () => {
      ensureLayout();
      return cachedLayout.layoutColumns();
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutContainer", {
    value: (name: string) => {
      ensureLayout();
      return cachedLayout.layoutContainer(name);
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutStyle", {
    value: (group: string, variant: string) => {
      ensureLayout();
      return cachedLayout.layoutStyle(group, variant);
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutStack", {
    value: (name: string) => {
      ensureLayout();
      return cachedLayout.layoutStack(name);
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutGrid", {
    value: (name: string) => {
      ensureLayout();
      return cachedLayout.layoutGrid(name);
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutClassPrefix", {
    get() {
      ensureLayout();
      return cachedLayout.layoutClassPrefix;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutColumnsMixin", {
    value: () => {
      ensureLayout();
      return cachedLayout.layoutColumnsMixin();
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutContainerMixin", {
    value: (name: string) => {
      ensureLayout();
      return cachedLayout.layoutContainerMixin(name);
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutStyleMixin", {
    value: (group: string, variant: string) => {
      ensureLayout();
      return cachedLayout.layoutStyleMixin(group, variant);
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutStackMixin", {
    value: (name: string) => {
      ensureLayout();
      return cachedLayout.layoutStackMixin(name);
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "layoutGridMixin", {
    value: (name: string) => {
      ensureLayout();
      return cachedLayout.layoutGridMixin(name);
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
      const allNodes = collectNodes();
      ensureLayout();
      const layoutCss = cachedLayout.layoutCSS;
      const rendered = renderToCssString(allNodes);
      if (!rendered) return layoutCss || "";
      if (!layoutCss) return rendered;
      return `${rendered}\n\n${layoutCss}`;
    },
    enumerable: true,
    configurable: true,
  });

  return clone;
}
