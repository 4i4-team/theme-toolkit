import { media } from "../../subsystems/media";
import type {
  MediaConfig,
  ThemeWithMedia,
  MediaGroup,
} from "../../subsystems/media";
import type { Breakpoints, NormalizedPropertyValue } from "../common";
import {
  normalizePropertyValue,
  generateTokens,
  generateCssVariables,
  renderToCssString,
  normalizeCssVariablePrefix,
} from "../common";
import { css } from "styled-components";
import { createPaletteThemeHelper, lighten, darken } from "../../subsystems/colors";
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

type ThemeWithBreakpoints<T extends string, TPaletteKey extends string> = {
  breakpoints: Breakpoints<T>;
  typography?: TypographySource;
  palette?: Record<TPaletteKey, PaletteSource>;
  paletteRecipes?: PaletteRecipeSource<T>;
  layout?: LayoutConfig<T>;
};

type PaletteRecipeNamespace<TBreakpoint extends string> = {
  readonly css: string;
  readonly classes: Record<string, Record<string, string>>;
  readonly styles: Record<string, PaletteRecipeStyleMap<TBreakpoint>>;
  getClass: (group: string, variant: string) => string | undefined;
};

type PaletteThemeNamespace<TPaletteKey extends string, TBreakpoint extends string> = {
  readonly source?: PaletteCollection<TPaletteKey>;
  readonly tokens: Record<TPaletteKey, PaletteTokens>;
  readonly css: string;
  lighten: (name: TPaletteKey, percent: number) => string;
  darken: (name: TPaletteKey, percent: number) => string;
  readonly recipes: PaletteRecipeNamespace<TBreakpoint>;
};

type ThemeWithPalette<TPaletteKey extends string, TBreakpoint extends string> = {
  colors: PaletteThemeNamespace<TPaletteKey, TBreakpoint>;
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
  css: string;
  selectors: Record<string, Record<string, string>>;
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
  ThemeWithLayout<T> {
  const paletteHelper = createPaletteThemeHelper();
  const clone = { ...theme } as TTheme &
    ThemeWithMedia<T> &
    ThemeWithBreakpoints<T, TPaletteKey> &
    ThemeWithPalette<TPaletteKey, T> &
    ThemeWithTypography &
    ThemeWithLayout<T>;

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

  const buildPaletteCss = (
    tokens: Record<TPaletteKey, PaletteTokens>,
  ): string => {
    if (!Object.keys(tokens).length) {
      return "";
    }

    const prefix = normalizeCssVariablePrefix(options?.palette?.prefix);
    const variables = paletteHelper.mapCssVariables
      ? paletteHelper.mapCssVariables(tokens, prefix)
      : generateCssVariables(tokens, { prefix });

    return renderToCssString([
      {
        kind: "variables",
        selector: ":root",
        variables,
      },
    ]);
  };

  let cachedBreakpoints = clone.breakpoints;
  let cachedMediaConfig = resolveMediaConfig(clone, options?.media);
  let cachedMedia = media(cachedBreakpoints, cachedMediaConfig);
  let cachedPaletteSource = clone.palette;
  let cachedPaletteBreakpoints = clone.breakpoints;
  let cachedNormalizedPalette = normalizePaletteCollection(
    cachedPaletteSource,
    cachedPaletteBreakpoints,
  );
  let cachedPaletteTokens = buildPaletteTokensFromNormalized(cachedNormalizedPalette);
  let cachedPaletteCSS = buildPaletteCss(cachedPaletteTokens);
  let cachedPaletteRecipesSource = clone.paletteRecipes;
  let cachedPaletteRecipeTokens = cachedPaletteTokens;
  let cachedPaletteRecipeBreakpoints = cachedPaletteBreakpoints;
  let cachedPaletteRecipeMedia = cachedMedia;
  const buildPaletteRecipesOutput = (
    recipes: PaletteRecipeSource<T> | undefined,
    tokens: Record<TPaletteKey, PaletteTokens>,
    breakpoints: Breakpoints<T>,
    mediaHelpers: MediaHelpers<T>,
  ): PaletteRecipeOutput<T> => {
    if (!paletteHelper.buildRecipes) {
      return {
        css: "",
        selectors: {},
        classes: {},
        styles: {},
      };
    }

    return paletteHelper.buildRecipes(recipes, tokens, {
      breakpoints,
      media: mediaHelpers,
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
    const currentPalette = clone.palette;
    const currentBreakpoints = clone.breakpoints;

    if (
      currentPalette !== cachedPaletteSource ||
      currentBreakpoints !== cachedPaletteBreakpoints
    ) {
      cachedPaletteSource = currentPalette;
      cachedPaletteBreakpoints = currentBreakpoints;
      cachedNormalizedPalette = normalizePaletteCollection(
        currentPalette,
        currentBreakpoints,
      );
      cachedPaletteTokens = buildPaletteTokensFromNormalized(cachedNormalizedPalette);
      cachedPaletteCSS = buildPaletteCss(cachedPaletteTokens);
      cachedPaletteRecipeTokens = cachedPaletteTokens;
    }
  };

  const getPaletteTokens = () => {
    syncPalette();
    return cachedPaletteTokens;
  };

  const getPaletteCss = () => {
    syncPalette();
    return cachedPaletteCSS;
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

  Object.defineProperty(clone, "media", {
    get() {
      const currentTheme = this as typeof clone;
      const currentBreakpoints = currentTheme.breakpoints;
      const currentConfig = resolveMediaConfig(currentTheme, options?.media);

      const configChanged =
        currentConfig.unit !== cachedMediaConfig.unit ||
        currentConfig.baseFontSize !== cachedMediaConfig.baseFontSize;

      if (currentBreakpoints !== cachedBreakpoints || configChanged) {
        cachedBreakpoints = currentBreakpoints;
        cachedMediaConfig = currentConfig;
        cachedMedia = media(currentBreakpoints, currentConfig);
      }

      return cachedMedia;
    },
    enumerable: true,
    configurable: true,
  });

  const ensurePaletteRecipes = () => {
    syncPalette();
    const currentTheme = clone as typeof clone;
    const tokens = getPaletteTokens();
    const recipesSource = currentTheme.paletteRecipes;
    const mediaHelpers = clone.media;
    const recipeBreakpoints = currentTheme.breakpoints;

    if (
      recipesSource !== cachedPaletteRecipesSource ||
      tokens !== cachedPaletteRecipeTokens ||
      mediaHelpers !== cachedPaletteRecipeMedia ||
      recipeBreakpoints !== cachedPaletteRecipeBreakpoints
    ) {
      cachedPaletteRecipesSource = recipesSource;
      cachedPaletteRecipeTokens = tokens;
      cachedPaletteRecipeMedia = mediaHelpers;
      cachedPaletteRecipeBreakpoints = recipeBreakpoints;
      cachedPaletteRecipes = buildPaletteRecipesOutput(
        recipesSource,
        tokens,
        recipeBreakpoints,
        mediaHelpers,
      );
    }
  };

  const paletteRecipesNamespace: PaletteRecipeNamespace<T> = {
    get css() {
      ensurePaletteRecipes();
      return cachedPaletteRecipes.css;
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
      return clone.palette as PaletteCollection<TPaletteKey> | undefined;
    },
    get tokens() {
      return getPaletteTokens();
    },
    get css() {
      return getPaletteCss();
    },
    lighten: (name, percent) => lighten(resolveBaseColor(name), percent),
    darken: (name, percent) => darken(resolveBaseColor(name), percent),
    recipes: paletteRecipesNamespace,
  };

  Object.defineProperty(clone, "colors", {
    value: paletteNamespace,
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

  return clone;
}
