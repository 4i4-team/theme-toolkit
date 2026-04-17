import { media } from "../../subsystems/media";
import type {
  MediaConfig,
  ThemeWithMedia,
  MediaGroup,
} from "../../subsystems/media";
import type { Breakpoints, CssNode, CssRuleNode, CssVariablesNode, NormalizedPropertyValue } from "../common";
import {
  normalizePropertyValue,
  generateTokens,
  generateCssVariables,
  renderToCssString,
  normalizeCssVariablePrefix,
  expandResponsiveCssVariables,
} from "../common";
import {
  buildMediaDescriptor,
  mediaQueryString,
  resolveMediaConfig as resolveCoreMediaConfig,
} from "../media";
import type { MediaDescriptor } from "../media";
import { css } from "styled-components";
import {
  createPaletteCssVariableResolver,
  createPaletteThemeHelper,
  darken,
  lighten,
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
import { createTypographyThemeHelper } from "../../subsystems/typography";
import type { TypographySource, TypographyTokens } from "../../subsystems/typography";
import { buildGridTokens } from "../../subsystems/layout";
import type {
  LayoutConfig,
  LayoutTokens,
  LayoutHelpers,
  LayoutBuilderOptions,
} from "../../subsystems/layout";
import type { MediaHelpers } from "../../subsystems/media";

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

type PaletteRecipeNamespace<TBreakpoint extends string> = {
  readonly nodes: CssRuleNode[];
  readonly classes: Record<string, Record<string, string>>;
  readonly styles: Record<string, PaletteRecipeStyleMap<TBreakpoint>>;
  getClass: (group: string, variant: string) => string | undefined;
};

type PaletteThemeNamespace<TPaletteKey extends string, TBreakpoint extends string> = {
  readonly source?: PaletteCollection<TPaletteKey>;
  readonly tokens: Record<TPaletteKey, PaletteTokens>;
  readonly variables: CssVariablesNode[];
  lighten: (name: TPaletteKey, percent: number) => string;
  darken: (name: TPaletteKey, percent: number) => string;
  readonly recipes: PaletteRecipeNamespace<TBreakpoint>;
};

type ThemeWithPalette<TPaletteKey extends string, TBreakpoint extends string> = {
  colors: PaletteThemeNamespace<TPaletteKey, TBreakpoint>;
};

type ThemeWithAggregateCss = {
  readonly css: string;
  readonly nodes: CssNode[];
};

type TypographyNamespace = {
  readonly source?: TypographySource;
  readonly tokens?: TypographyTokens;
  readonly css: string;
  mixin: (group: string, variant: string) => ReturnType<typeof css>;
};

type ThemeWithTypography = {
  typography: TypographyNamespace;
};

type TypographyThemeSlice = {
  source?: TypographySource;
  tokens?: TypographyTokens;
  css: string;
  mixin: (group: string, variant: string) => ReturnType<typeof css>;
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
  layoutColumnsMixin: () => ReturnType<typeof css>;
  layoutContainerMixin: (name: string) => ReturnType<typeof css>;
  layoutStyleMixin: (group: string, variant: string) => ReturnType<typeof css>;
  layoutStackMixin: (name: string) => ReturnType<typeof css>;
  layoutGridMixin: (name: string) => ReturnType<typeof css>;
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
  const buildPaletteRecipesOutput = (
    recipes: PaletteRecipeSource<T> | undefined,
    tokens: Record<TPaletteKey, PaletteTokens>,
    breakpoints: Breakpoints<T>,
    mediaDescriptor: MediaDescriptor<T>,
  ): PaletteRecipeOutput<T> => {
    if (!paletteHelper.buildRecipes) {
      return {
        nodes: [],
        classes: {},
        styles: {},
      };
    }

    return paletteHelper.buildRecipes(recipes, tokens, {
      breakpoints,
      media: mediaDescriptor,
      options: options?.palette,
    }) as PaletteRecipeOutput<T>;
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
  let rawTypographySource = clone.typography as TypographySource | undefined;
  let cachedTypographySource = rawTypographySource;
  let cachedTypographySlice = typographyHelper.buildHelpers(
    rawTypographySource,
    options?.typography,
  ) as TypographyThemeSlice;
  const syncTypography = () => {
    if (rawTypographySource !== cachedTypographySource) {
      cachedTypographySlice = typographyHelper.buildHelpers(
        rawTypographySource,
        options?.typography,
      ) as TypographyThemeSlice;
      cachedTypographySource = rawTypographySource;
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

  const paletteRecipesNamespace: PaletteRecipeNamespace<T> = {
    get nodes() {
      ensurePaletteRecipes();
      return cachedPaletteRecipes.nodes;
    },
    get classes() {
      ensurePaletteRecipes();
      return cachedPaletteRecipes.classes;
    },
    get styles() {
      ensurePaletteRecipes();
      return cachedPaletteRecipes.styles;
    },
    getClass(group, variant) {
      ensurePaletteRecipes();
      return cachedPaletteRecipes.classes[group]?.[variant];
    },
  };

  const resolveBaseColor = (name: TPaletteKey): string => {
    const tokens = getPaletteTokens();
    const palette = tokens[name];
    if (!palette) {
      throw new Error(`Palette color "${String(name)}" is not defined.`);
    }
    return palette.variants.main;
  };

  const paletteNamespace: PaletteThemeNamespace<TPaletteKey, T> = {
    get source() {
      return extractPaletteProperties(rawColorsSource);
    },
    get tokens() {
      return getPaletteTokens();
    },
    get variables() {
      return getPaletteVariables();
    },
    lighten: (name, percent) => lighten(resolveBaseColor(name), percent),
    darken: (name, percent) => darken(resolveBaseColor(name), percent),
    recipes: paletteRecipesNamespace,
  };

  Object.defineProperty(clone, "colors", {
    get() {
      return paletteNamespace;
    },
    set(value: ColorsSubsystemSource<TPaletteKey, T> | undefined) {
      rawColorsSource = value;
    },
    enumerable: true,
    configurable: true,
  });

  const typographyNamespace: TypographyNamespace = {
    get source() {
      return rawTypographySource;
    },
    get tokens() {
      syncTypography();
      return cachedTypographySlice.tokens;
    },
    get css() {
      syncTypography();
      return cachedTypographySlice.css;
    },
    mixin: (group: string, variant: string) => {
      syncTypography();
      const baseMixin = cachedTypographySlice.mixin;
      const tokens = cachedTypographySlice.tokens;
      const mixin = baseMixin(group, variant);
      const responsive = rawTypographySource?.styles?.[group]?.[variant]?.responsive ?? [];

      if (!responsive.length || !clone.media || !tokens) {
        return mixin;
      }

      const responsiveCss = responsive.map(rule => {
        const mediaGroup = (clone.media as unknown as Record<string, MediaGroup | undefined>)[
          rule.breakpoint
        ];

        if (!mediaGroup) {
          return css``;
        }

        const mediaTemplate = mediaGroup[rule.query ?? "exact"];
        if (!mediaTemplate) {
          return css``;
        }

        const scale = rule.size ? tokens.scale[rule.size] : undefined;
        const weight = rule.weight ? tokens.weights[rule.weight] : undefined;
        const lineHeight = rule.lineHeight
          ? tokens.lineHeights[rule.lineHeight]
          : undefined;
        const letterSpacing = rule.letterSpacing
          ? tokens.letterSpacings[rule.letterSpacing]
          : undefined;

        return mediaTemplate`
          ${scale ? `font-size: ${scale.value}${scale.unit};` : ""}
          ${weight ? `font-weight: ${weight};` : ""}
          ${lineHeight !== undefined ? `line-height: ${lineHeight};` : ""}
          ${letterSpacing !== undefined ? `letter-spacing: ${letterSpacing};` : ""}
        `;
      });

      return css`
        ${mixin}
        ${responsiveCss}
      `;
    },
  };

  Object.defineProperty(clone, "typography", {
    get() {
      return typographyNamespace;
    },
    set(value: TypographySource | undefined) {
      rawTypographySource = value as TypographySource | undefined;
      cachedTypographySource = rawTypographySource;
      cachedTypographySlice = typographyHelper.buildHelpers(
        rawTypographySource,
        options?.typography,
      ) as TypographyThemeSlice;
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
    nodes.push(...paletteNamespace.variables);
    nodes.push(...paletteRecipesNamespace.nodes);
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
      const rendered = renderToCssString(collectNodes());
      const legacyParts: string[] = [];
      const typographyCss = typographyNamespace.css;
      if (typographyCss) legacyParts.push(typographyCss);
      ensureLayout();
      if (cachedLayout.layoutCSS) legacyParts.push(cachedLayout.layoutCSS);
      const legacy = legacyParts.join("\n\n");
      if (!rendered) return legacy;
      if (!legacy) return rendered;
      return `${rendered}\n\n${legacy}`;
    },
    enumerable: true,
    configurable: true,
  });

  return clone;
}
