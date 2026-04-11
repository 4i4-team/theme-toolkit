import { media } from "../media";
import type {
  Breakpoints,
  MediaConfig,
  ThemeWithMedia,
  MediaGroup,
} from "../media";
import { css } from "styled-components";
import { buildPaletteTokens, lighten, darken } from "../colors";
import type {
  PaletteBuilderOptions,
  PaletteSource,
  PaletteTokens,
} from "../colors";
import {
  buildTypographyTokens,
  serializeTypographyToCSS,
  typographyMixin,
} from "../typography";
import type { TypographySource, TypographyTokens, TypographyScaleUnit } from "../typography";
import { buildGridTokens } from "../layout";
import type {
  LayoutConfig,
  LayoutTokens,
  LayoutHelpers,
  LayoutBuilderOptions,
} from "../layout";

type ThemeWithBreakpoints<T extends string, TPaletteKey extends string> = {
  breakpoints: Breakpoints<T>;
  typography?: TypographySource;
  palette?: Record<TPaletteKey, PaletteSource>;
  layout?: LayoutConfig<T>;
};

type PaletteDerived<TPaletteKey extends string> = {
  paletteTokens: Record<TPaletteKey, PaletteTokens>;
  paletteCSS: string;
};

type ThemeWithPalette<TPaletteKey extends string> = PaletteDerived<TPaletteKey> & {
  lightenColor: (name: TPaletteKey, percent: number) => string;
  darkenColor: (name: TPaletteKey, percent: number) => string;
};

type ThemeWithTypography = {
  typographyTokens?: TypographyTokens;
  typographyCSS: string;
  typographyMixin: (group: string, variant: string) => ReturnType<typeof typographyMixin>;
};

type ThemeWithLayout<T extends string> = {
  layoutTokens?: LayoutTokens<T>;
  layoutCSS: string;
  layoutSpacing: LayoutHelpers<T>["spacing"];
  layoutGutter: LayoutHelpers<T>["gutter"];
  layoutColumns: LayoutHelpers<T>["buildColumns"];
  layoutContainer: LayoutHelpers<T>["buildContainer"];
  layoutStyle: LayoutHelpers<T>["layout"];
  layoutColumnsMixin: () => ReturnType<typeof css>;
  layoutContainerMixin: (name: string) => ReturnType<typeof css>;
  layoutStyleMixin: (group: string, variant: string) => ReturnType<typeof css>;
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
    overrides?.baseFontSize ?? theme.typography?.scale?.baseFontSize ?? 16,
});

const buildPaletteHelpers = <TPaletteKey extends string>(
  paletteSource: Record<TPaletteKey, PaletteSource> | undefined,
  options?: PaletteBuilderOptions,
): PaletteDerived<TPaletteKey> => {
  if (!paletteSource) {
    return {
      paletteTokens: {} as Record<TPaletteKey, PaletteTokens>,
      paletteCSS: "",
    };
  }

  const { tokens, toCSS } = buildPaletteTokens(paletteSource, options);

  return {
    paletteTokens: tokens,
    paletteCSS: toCSS(),
  };
};

const buildTypographyHelpers = (
  source: TypographySource | undefined,
  unit: TypographyScaleUnit,
  prefix?: string,
): ThemeWithTypography => {
  if (!source) {
    return {
      typographyTokens: undefined,
      typographyCSS: "",
      typographyMixin: () => {
        throw new Error("Typography source is not defined.");
      },
    };
  }

  const tokens = buildTypographyTokens(source, { unit });
  const css = serializeTypographyToCSS(tokens, prefix);

  return {
    typographyTokens: tokens,
    typographyCSS: css,
    typographyMixin: (group, variant) => typographyMixin(tokens, group, variant),
  };
};

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
    layoutColumnsMixin: () => error(),
    layoutContainerMixin: () => error(),
    layoutStyleMixin: () => error(),
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
  ThemeWithPalette<TPaletteKey> &
  ThemeWithTypography &
  ThemeWithLayout<T> {
  const clone = { ...theme } as TTheme &
    ThemeWithMedia<T> &
    ThemeWithBreakpoints<T, TPaletteKey> &
    ThemeWithPalette<TPaletteKey> &
    ThemeWithTypography &
    ThemeWithLayout<T>;

  let cachedBreakpoints = clone.breakpoints;
  let cachedMediaConfig = resolveMediaConfig(clone, options?.media);
  let cachedMedia = media(cachedBreakpoints, cachedMediaConfig);
  let cachedPaletteSource = clone.palette;
  let cachedPalette = buildPaletteHelpers(cachedPaletteSource, options?.palette);
  let cachedTypographySource = clone.typography;
  let cachedTypography = buildTypographyHelpers(
    cachedTypographySource,
    options?.typography?.unit ?? "px",
    options?.typography?.prefix,
  );
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

  Object.defineProperty(clone, "paletteTokens", {
    get() {
      const currentTheme = this as typeof clone;
      if (currentTheme.palette !== cachedPaletteSource) {
        cachedPaletteSource = currentTheme.palette;
        cachedPalette = buildPaletteHelpers(
          cachedPaletteSource,
          options?.palette,
        );
      }

      return cachedPalette.paletteTokens;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "paletteCSS", {
    get() {
      // ensure tokens are up to date
      void clone.paletteTokens;
      return cachedPalette.paletteCSS;
    },
    enumerable: true,
    configurable: true,
  });

  const resolveBaseColor = (name: TPaletteKey): string => {
    const tokens = clone.paletteTokens;
    const palette = tokens[name];
    if (!palette) {
      throw new Error(`Palette color "${String(name)}" is not defined.`);
    }
    return palette.variants.main;
  };

  Object.defineProperty(clone, "lightenColor", {
    value: (name: TPaletteKey, percent: number) =>
      lighten(resolveBaseColor(name), percent),
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "darkenColor", {
    value: (name: TPaletteKey, percent: number) =>
      darken(resolveBaseColor(name), percent),
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "typographyTokens", {
    get() {
      const current = this as typeof clone;
      if (current.typography !== cachedTypographySource) {
        cachedTypographySource = current.typography;
        cachedTypography = buildTypographyHelpers(
          cachedTypographySource,
          options?.typography?.unit ?? "px",
          options?.typography?.prefix,
        );
      }

      return cachedTypography.typographyTokens;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "typographyCSS", {
    get() {
      // ensure tokens synced
      void clone.typographyTokens;
      return cachedTypography.typographyCSS;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "typographyMixin", {
    get() {
      // ensure tokens synced
      void clone.typographyTokens;
      const baseTokens = cachedTypography.typographyTokens;
      const baseMixin = cachedTypography.typographyMixin;

      return (group: string, variant: string) => {
        const mixin = baseMixin(group, variant);
        const responsive = clone.typography?.styles?.[group]?.[variant]?.responsive ?? [];

        if (!responsive.length || !clone.media || !baseTokens) {
          return mixin;
        }

        const responsiveCss = responsive.map(rule => {
          const mediaGroup = (clone.media as Record<string, MediaGroup>)[rule.breakpoint];

          if (!mediaGroup) {
            return css``;
          }

          const scale = rule.size ? baseTokens.scale[rule.size] : undefined;
          const weight = rule.weight ? baseTokens.weights[rule.weight] : undefined;
          const lineHeight = rule.lineHeight
            ? baseTokens.lineHeights[rule.lineHeight]
            : undefined;
          const letterSpacing = rule.letterSpacing
            ? baseTokens.letterSpacings[rule.letterSpacing]
            : undefined;

          return mediaGroup[rule.query ?? "exact"]`
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
      };
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

  return clone;
}
