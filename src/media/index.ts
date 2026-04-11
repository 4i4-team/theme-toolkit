import { css } from "styled-components";
import { Interpolation } from "styled-components/dist/types";

type Breakpoints<T extends string> = Readonly<Record<T, number>>;
type MediaTemplate = (
  styles: TemplateStringsArray,
  ...interpolations: Interpolation<object>[]
) => ReturnType<typeof css>;
type MediaEntry = MediaTemplate & { readonly query: string };
type MediaGroup = Readonly<Record<"min" | "max" | "exact", MediaEntry>>;
export type ThemeWithMedia<T extends string> = {
  readonly media: MediaHelpers<T>;
};

export type MediaUnit = "px" | "em" | "rem";
export type MediaConfig = {
  unit?: MediaUnit;
  baseFontSize?: number;
};

const DEFAULT_MEDIA_CONFIG: Required<MediaConfig> = {
  unit: "px",
  baseFontSize: 16,
};

const normalizeMediaConfig = (
  config?: MediaConfig,
): Required<MediaConfig> => ({
  unit: config?.unit ?? DEFAULT_MEDIA_CONFIG.unit,
  baseFontSize:
    config?.baseFontSize && config.baseFontSize > 0
      ? config.baseFontSize
      : DEFAULT_MEDIA_CONFIG.baseFontSize,
});

export type DefaultBreakpointKey = "xs" | "sm" | "md" | "lg" | "xl";
export type DefaultBreakpoints = Breakpoints<DefaultBreakpointKey>;

export const DEFAULT_BREAKPOINTS: DefaultBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1280,
};

export const sortBreakpointKeys = <T extends string>(
  breakpoints: Breakpoints<T>,
): T[] =>
  (Object.keys(breakpoints) as T[]).sort(
    (a, b) => breakpoints[a] - breakpoints[b],
  );

type MediaQueryOptions = {
  min?: number;
  max?: number;
  orientation?: "landscape" | "portrait";
};

type MediaQueryOrientationOptions = Pick<MediaQueryOptions, "orientation">;

export type MediaHelpers<T extends string> = Readonly<
  Record<T, MediaGroup> & {
    readonly min: (
      key: T,
      options?: MediaQueryOrientationOptions,
    ) => MediaEntry;
    readonly max: (
      key: T,
      options?: MediaQueryOrientationOptions,
    ) => MediaEntry;
    readonly between: (
      from: T,
      to: T,
      options?: MediaQueryOrientationOptions,
    ) => MediaEntry;
  }
>;

type MediaQueryFn = (
  styles: TemplateStringsArray,
  ...interpolations: Interpolation<object>[]
) => ReturnType<typeof css>;

const formatWidth = (value: number, config: Required<MediaConfig>): string => {
  if (config.unit === "px") {
    return `${value}px`;
  }

  const converted = value / config.baseFontSize;
  const trimmed = Number(converted.toFixed(4));
  return `${trimmed}${config.unit}`;
};

const createMediaQueryTemplate = (query: string): MediaTemplate => (
  styles,
  ...interpolations
) => css`
  ${query} {
    ${css(styles, ...interpolations)}
  }
`;

export function mediaQuery(
  { min, max, orientation }: MediaQueryOptions,
  config?: MediaConfig,
): string {
  const clauses: string[] = [];
  const resolvedConfig = normalizeMediaConfig(config);

  if (min !== undefined && max !== undefined && min > max) {
    throw new Error(
      "Invalid media query: `min` cannot be greater than `max`.",
    );
  }

  if (min !== undefined) {
    clauses.push(`(min-width: ${formatWidth(min, resolvedConfig)})`);
  }

  if (max !== undefined) {
    clauses.push(`(max-width: ${formatWidth(max, resolvedConfig)})`);
  }

  if (orientation) {
    clauses.push(`(orientation: ${orientation})`);
  }

  if (!clauses.length) {
    return "";
  }

  return `@media ${clauses.join(" and ")}`;
}

const styledMediaQuery = (
  options: MediaQueryOptions,
  config?: MediaConfig,
): MediaTemplate => {
  const query = mediaQuery(options, config);
  if (!query) {
    return ((styles, ...interpolations) => css`
      ${css(styles, ...interpolations)}
    `) as MediaTemplate;
  }

  return createMediaQueryTemplate(query);
};

const buildMediaEntry = (
  options: MediaQueryOptions,
  config?: MediaConfig,
): MediaEntry => {
  const query = mediaQuery(options, config);
  const template = styledMediaQuery(options, config);
  return Object.assign(template, { query }) as MediaEntry;
};

export function breakpoint({
  min,
  max,
  config,
}: {
  min?: number;
  max?: number;
  config?: MediaConfig;
}): MediaGroup {
  return {
    min: buildMediaEntry({ min }, config),
    max: buildMediaEntry({ max }, config),
    exact: buildMediaEntry({ min, max }, config),
  };
}

export function media<T extends string>(
  breakpoints: Breakpoints<T>,
  config?: MediaConfig,
): MediaHelpers<T> {
  const keys = sortBreakpointKeys(breakpoints);
  const resolvedConfig = normalizeMediaConfig(config);

  const mediaGroups = keys.reduce<Record<T, MediaGroup>>(
    (accumulator, key, index) => {
      const min = breakpoints[key];
      const nextKey = keys[index + 1];
      const max = nextKey ? breakpoints[nextKey] : undefined;

      accumulator[key] = breakpoint({ min, max, config: resolvedConfig });
      return accumulator;
    },
    {} as Record<T, MediaGroup>,
  );

  const resolveKey = (key: T): MediaGroup => {
    const group = mediaGroups[key];
    if (!group) {
      throw new Error(`Breakpoint "${key}" is not defined.`);
    }
    return group;
  };

  const between = (
    from: T,
    to: T,
    options?: MediaQueryOrientationOptions,
  ): MediaEntry => {
    const min = breakpoints[from];
    const max = breakpoints[to];

    if (min === undefined || max === undefined) {
      throw new Error(
        `Cannot build media query between "${from}" and "${to}" breakpoints.`,
      );
    }

    return buildMediaEntry({ min, max, ...options }, resolvedConfig);
  };

  return Object.assign(mediaGroups, {
    min: (key: T, options?: MediaQueryOrientationOptions) => {
      if (!options) {
        return resolveKey(key).min;
      }

      return buildMediaEntry({ min: breakpoints[key], ...options }, resolvedConfig);
    },
    max: (key: T, options?: MediaQueryOrientationOptions) => {
      if (!options) {
        return resolveKey(key).max;
      }

      return buildMediaEntry({ max: breakpoints[key], ...options }, resolvedConfig);
    },
    between,
  }) as MediaHelpers<T>;
}

export type { Breakpoints, MediaGroup };
