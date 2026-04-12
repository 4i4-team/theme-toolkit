import { css } from "styled-components";
import { Breakpoints, sortBreakpointKeys, mediaQuery } from "../media";
import type { MediaConfig } from "../media";

export type ResponsiveQuery = "min" | "max" | "exact";

type Scalar = number | string;

export type ResponsiveValueInput = {
  breakpoint: string;
  query?: ResponsiveQuery;
  value?: Scalar;
  token?: string;
};

export type TokenValueInput =
  | Scalar
  | {
      value?: Scalar;
      token?: string;
      responsive?: ResponsiveValueInput[];
    };

export type SpacingInput = Scalar | Record<string, TokenValueInput>;

export type GuttersInput = Scalar | Record<string, TokenValueInput>;

export type ColumnsInput =
  | number
  | {
      size: number;
      gutter?: TokenValueInput;
      inset?: TokenValueInput;
    };

export type ContainerMode = "fixed" | "fluid";

export type ContainerMaxWidthInput<TBreakpoint extends string> =
  | { mode: "breakpoint"; value: TBreakpoint }
  | { mode: "custom"; value: Scalar }
  | { mode: "none" };

export type ContainerInput<TBreakpoint extends string> =
  | Scalar
  | {
      mode?: ContainerMode;
      inset?: TokenValueInput;
      clampTo?: { breakpoint: TBreakpoint };
      maxWidth?: ContainerMaxWidthInput<TBreakpoint>;
    };

export type ContainersInput<TBreakpoint extends string> = Record<string, ContainerInput<TBreakpoint>>;

export type LayoutStyleDefinition = {
  marginY?: TokenValueInput;
  marginX?: TokenValueInput;
  paddingY?: TokenValueInput;
  paddingX?: TokenValueInput;
  gap?: TokenValueInput;
  background?: string;
  responsive?: Array<
    {
      breakpoint: string;
      query?: ResponsiveQuery;
    } & Omit<LayoutStyleDefinition, "responsive">
  >;
};

export type LayoutStylesInput = Record<string, Record<string, LayoutStyleDefinition>>;

export type StackDefinition = {
  direction?: "row" | "column";
  align?: string;
  justify?: string;
  wrap?: string;
  inline?: boolean;
  gap?: TokenValueInput;
  responsive?: Array<
    {
      breakpoint: string;
      query?: ResponsiveQuery;
      direction?: "row" | "column";
      align?: string;
      justify?: string;
      wrap?: string;
      inline?: boolean;
    }
  >;
};

export type StacksInput = Record<string, StackDefinition>;

export type GridDefinition = {
  templateColumns?: string;
  templateRows?: string;
  autoRows?: string;
  autoColumns?: string;
  justifyItems?: string;
  alignItems?: string;
  justifyContent?: string;
  alignContent?: string;
  gap?: TokenValueInput;
  responsive?: Array<GridResponsiveDefinition>;
};

export type GridResponsiveDefinition = {
  breakpoint: string;
  query?: ResponsiveQuery;
  templateColumns?: string;
  templateRows?: string;
  autoRows?: string;
  autoColumns?: string;
  justifyItems?: string;
  alignItems?: string;
  justifyContent?: string;
  alignContent?: string;
  gap?: TokenValueInput;
};

export type GridsInput = Record<string, GridDefinition>;

export type LayoutConfig<TBreakpoint extends string> = {
  spacing: SpacingInput;
  gutters?: GuttersInput;
  columns?: ColumnsInput;
  containers?: ContainersInput<TBreakpoint>;
  styles?: LayoutStylesInput;
  stacks?: StacksInput;
  grids?: GridsInput;
};

export type GridSource<TBreakpoint extends string> = {
  layout: LayoutConfig<TBreakpoint>;
};

type NormalizedResponsiveValue = {
  breakpoint: string;
  query: ResponsiveQuery;
  value: string;
};

type NormalizedScalarToken = {
  value: string;
  responsive: NormalizedResponsiveValue[];
};

type NormalizedColumns = {
  size: number;
  gutter: NormalizedScalarToken;
  inset: NormalizedScalarToken;
};

type NormalizedContainer<TBreakpoint extends string> = {
  mode: ContainerMode;
  inset: NormalizedScalarToken;
  clampTo?: TBreakpoint;
  maxWidth?: string;
  widths: Record<TBreakpoint, string>;
};

type LayoutStyleValues = {
  marginY?: NormalizedScalarToken;
  marginX?: NormalizedScalarToken;
  paddingY?: NormalizedScalarToken;
  paddingX?: NormalizedScalarToken;
  gap?: NormalizedScalarToken;
  background?: string;
};

type NormalizedLayoutStyle = {
  values: LayoutStyleValues;
  responsive: Array<{
    breakpoint: string;
    query: ResponsiveQuery;
    values: LayoutStyleValues;
  }>;
};

type NormalizedStack = {
  direction: "row" | "column";
  align?: string;
  justify?: string;
  wrap?: string;
  inline: boolean;
  gap?: NormalizedScalarToken;
  responsive: Array<{
    breakpoint: string;
    query: ResponsiveQuery;
    direction?: "row" | "column";
    align?: string;
    justify?: string;
    wrap?: string;
    inline?: boolean;
  }>;
};

type NormalizedGrid = {
  templateColumns?: string;
  templateRows?: string;
  autoRows?: string;
  autoColumns?: string;
  justifyItems?: string;
  alignItems?: string;
  justifyContent?: string;
  alignContent?: string;
  gap?: NormalizedScalarToken;
  responsive: Array<{
    breakpoint: string;
    query: ResponsiveQuery;
    templateColumns?: string;
    templateRows?: string;
    autoRows?: string;
    autoColumns?: string;
    justifyItems?: string;
    alignItems?: string;
    justifyContent?: string;
    alignContent?: string;
    gap?: string;
  }>;
};

export type LayoutTokens<TBreakpoint extends string> = {
  spacing: Record<string, NormalizedScalarToken>;
  gutters: Record<string, NormalizedScalarToken>;
  columns: NormalizedColumns;
  containers: Record<string, NormalizedContainer<TBreakpoint>>;
  styles: Record<string, Record<string, NormalizedLayoutStyle>>;
  stacks: Record<string, NormalizedStack>;
  grids: Record<string, NormalizedGrid>;
};

export type LayoutHelpers<TBreakpoint extends string> = {
  spacing: (token: string) => NormalizedScalarToken | undefined;
  gutter: (token: string) => NormalizedScalarToken | undefined;
  buildColumns: () => NormalizedColumns;
  buildContainer: (name: string) => NormalizedContainer<TBreakpoint> | undefined;
  layout: (group: string, variant: string) => NormalizedLayoutStyle | undefined;
  stack: (name: string) => NormalizedStack | undefined;
  grid: (name: string) => NormalizedGrid | undefined;
  columnsMixin: () => ReturnType<typeof css>;
  containerMixin: (name: string) => ReturnType<typeof css> | undefined;
  styleMixin: (group: string, variant: string) => ReturnType<typeof css> | undefined;
  stackMixin: (name: string) => ReturnType<typeof css> | undefined;
  gridMixin: (name: string) => ReturnType<typeof css> | undefined;
  classPrefix: string;
};

export type LayoutBuilderOptions = {
  prefix?: string;
  classPrefix?: string;
};

type TokenMapInput = SpacingInput | GuttersInput;

type RawTokenValue = TokenValueInput;

const DEFAULT_PREFIX = "--dt";
const DEFAULT_CLASS_PREFIX = "dt";
const DEFAULT_RESPONSIVE_QUERY: ResponsiveQuery = "exact";

const formatScalar = (value: Scalar): string =>
  typeof value === "number" ? `${value}px` : value;

const normalizePrefix = (prefix?: string): string => {
  if (!prefix) {
    return DEFAULT_PREFIX;
  }

  return prefix.startsWith("--") ? prefix : `--${prefix}`;
};

const normalizeClassPrefix = (classPrefix: string | undefined, fallback: string): string => {
  const source = classPrefix ?? fallback;
  const trimmed = source.replace(/^--/, "").trim();
  const sanitized = sanitizeSegment(trimmed);
  return sanitized || DEFAULT_CLASS_PREFIX;
};

const sanitizeSegment = (segment: string): string =>
  segment
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase();

const ensureRecord = <T>(value: T | undefined, fallback: T): T =>
  (value === undefined ? fallback : value);

const MEDIA_CONFIG: MediaConfig = {};

function normalizeTokenMap(
  label: string,
  input: TokenMapInput,
  { ensureNone }: { ensureNone?: boolean },
): Record<string, NormalizedScalarToken> {
  const rawEntries: Record<string, RawTokenValue> = {};

  if (typeof input === "number" || typeof input === "string") {
    rawEntries.default = input;
  } else {
    Object.assign(rawEntries, input);
  }

  if (ensureNone) {
    rawEntries.none = 0;
  }

  if (rawEntries.default === undefined) {
    throw new Error(`Missing "default" entry for ${label}.`);
  }

  const resolved = new Map<string, NormalizedScalarToken>();
  const resolving = new Set<string>();

  const resolveEntry = (key: string): NormalizedScalarToken => {
    if (resolved.has(key)) {
      return resolved.get(key)!;
    }

    if (resolving.has(key)) {
      throw new Error(`Circular reference detected while resolving ${label} token "${key}".`);
    }

    const raw = rawEntries[key];
    if (raw === undefined) {
      throw new Error(`Unknown ${label} token "${key}".`);
    }

    resolving.add(key);
    const normalized = normalizeValue(raw, key);
    resolved.set(key, normalized);
    resolving.delete(key);
    return normalized;
  };

  const resolveReference = (token: string, current: string): NormalizedScalarToken => {
    if (!(token in rawEntries)) {
      throw new Error(
        `Unknown ${label} token reference "${token}" from "${current}".`,
      );
    }
    if (token === current) {
      throw new Error(`Self reference detected in ${label} token "${current}".`);
    }
    return resolveEntry(token);
  };

  const normalizeValue = (
    raw: RawTokenValue,
    current: string,
  ): NormalizedScalarToken => {
    if (typeof raw === "number" || typeof raw === "string") {
      return {
        value: resolveScalar(raw, current),
        responsive: [],
      };
    }

    const base = raw.value !== undefined
      ? resolveScalar(raw.value, current)
      : raw.token
        ? resolveReference(raw.token, current).value
        : resolveEntry("default").value;

    const responsive = (raw.responsive ?? []).map(entry => {
      const responsiveValue = entry.value !== undefined
        ? resolveScalar(entry.value, current)
        : entry.token
          ? resolveReference(entry.token, current).value
          : base;

      return {
        breakpoint: entry.breakpoint,
        query: entry.query ?? DEFAULT_RESPONSIVE_QUERY,
        value: responsiveValue,
      };
    });

    return {
      value: base,
      responsive,
    };
  };

  const resolveScalar = (value: Scalar, current: string): string => {
    if (typeof value === "string" && rawEntries[value] !== undefined) {
      return resolveReference(value, current).value;
    }

    return formatScalar(value);
  };

  Object.keys(rawEntries).forEach(resolveEntry);

  return Object.fromEntries(resolved);
}

const resolveTokenReference = (
  source: string,
  input: TokenValueInput | undefined,
  fallbackToken: string,
  tokens: Record<string, NormalizedScalarToken>,
): NormalizedScalarToken => {
  if (!input) {
    const fallback = tokens[fallbackToken];
    if (!fallback) {
      throw new Error(`Unknown spacing token "${fallbackToken}" referenced from ${source}.`);
    }
    return fallback;
  }

  if (typeof input === "number" || typeof input === "string") {
    if (typeof input === "string" && tokens[input]) {
      return tokens[input];
    }
    return {
      value: formatScalar(input),
      responsive: [],
    };
  }

  const base = input.value !== undefined
    ? formatScalar(input.value)
    : input.token
      ? tokens[input.token]?.value
      : tokens[fallbackToken]?.value;

  if (base === undefined) {
    throw new Error(`Unable to resolve value for ${source}.`);
  }

  const responsive = (input.responsive ?? []).map(entry => {
    const responsiveValue = entry.value !== undefined
      ? formatScalar(entry.value)
      : entry.token
        ? tokens[entry.token]?.value
        : base;

    if (responsiveValue === undefined) {
      throw new Error(`Unable to resolve responsive value for ${source}.`);
    }

    return {
      breakpoint: entry.breakpoint,
      query: entry.query ?? DEFAULT_RESPONSIVE_QUERY,
      value: responsiveValue,
    };
  });

  return {
    value: base,
    responsive,
  };
};

const normalizeColumns = (
  input: ColumnsInput | undefined,
  spacing: Record<string, NormalizedScalarToken>,
): NormalizedColumns => {
  const config =
    typeof input === "number"
      ? { size: input }
      : input ?? { size: 12 };

  if (!config.size || config.size <= 0) {
    throw new Error("Column size must be a positive number.");
  }

  return {
    size: config.size,
    gutter: resolveTokenReference("columns.gutter", config.gutter, "default", spacing),
    inset: resolveTokenReference("columns.inset", config.inset, "none", spacing),
  };
};

const normalizeContainers = <TBreakpoint extends string>(
  input: ContainersInput<TBreakpoint> | undefined,
  spacing: Record<string, NormalizedScalarToken>,
  breakpoints: Breakpoints<TBreakpoint>,
): Record<string, NormalizedContainer<TBreakpoint>> => {
  const entries = Object.entries(input ?? {});

  if (!("default" in (input ?? {}))) {
    entries.push(["default", "none"]);
  }

  return entries.reduce<Record<string, NormalizedContainer<TBreakpoint>>>(
    (acc, [name, config]) => {
      const normalized = normalizeContainer(name, config, spacing, breakpoints);
      acc[name] = normalized;
      return acc;
    },
    {},
  );
};

const normalizeContainer = <TBreakpoint extends string>(
  name: string,
  input: ContainerInput<TBreakpoint>,
  spacing: Record<string, NormalizedScalarToken>,
  breakpoints: Breakpoints<TBreakpoint>,
): NormalizedContainer<TBreakpoint> => {
  const baseConfig =
    typeof input === "string" || typeof input === "number"
      ? { inset: input }
      : input ?? {};

  const mode: ContainerMode = name === "default"
    ? "fixed"
    : baseConfig.mode ?? "fixed";

  const clampTo = baseConfig.clampTo?.breakpoint as TBreakpoint | undefined;
  const inset = resolveTokenReference(`containers.${name}.inset`, baseConfig.inset, "none", spacing);
  const widths = buildContainerWidths(mode, clampTo, breakpoints);
  const maxWidth = mode === "fluid"
    ? resolveMaxWidth(baseConfig.maxWidth, breakpoints)
    : undefined;

  return {
    mode,
    clampTo,
    inset,
    maxWidth,
    widths,
  };
};

const buildContainerWidths = <TBreakpoint extends string>(
  mode: ContainerMode,
  clampTo: TBreakpoint | undefined,
  breakpoints: Breakpoints<TBreakpoint>,
): Record<TBreakpoint, string> => {
  const keys = sortBreakpointKeys(breakpoints);
  const widths = {} as Record<TBreakpoint, string>;
  const clampIndex = clampTo ? keys.indexOf(clampTo) : -1;

  keys.forEach((key, index) => {
    if (mode === "fluid") {
      widths[key] = "100%";
      return;
    }

    const referenceKey = clampIndex >= 0 && index > clampIndex ? clampTo! : key;
    const width = Math.max(0, breakpoints[referenceKey]);
    widths[key] = width === 0 ? "auto" : `${width}px`;
  });

  return widths;
};

const resolveMaxWidth = <TBreakpoint extends string>(
  input: ContainerMaxWidthInput<TBreakpoint> | undefined,
  breakpoints: Breakpoints<TBreakpoint>,
): string | undefined => {
  if (!input || input.mode === "none") {
    return undefined;
  }

  if (input.mode === "breakpoint") {
    const width = breakpoints[input.value];
    if (width === undefined) {
      throw new Error(
        `Unknown breakpoint "${input.value}" referenced in container maxWidth.`,
      );
    }
    return width === 0 ? "auto" : `${width}px`;
  }

  return formatScalar(input.value);
};

const normalizeStyles = (
  input: LayoutStylesInput | undefined,
  spacing: Record<string, NormalizedScalarToken>,
) => {
  if (!input) {
    return {} as Record<string, Record<string, NormalizedLayoutStyle>>;
  }

  return Object.entries(input).reduce(
    (groups, [group, variants]) => {
      groups[group] = Object.entries(variants).reduce<Record<string, NormalizedLayoutStyle>>(
        (acc, [variant, definition]) => {
          acc[variant] = normalizeStyleVariant(
            `styles.${group}.${variant}`,
            definition,
            spacing,
          );
          return acc;
        },
        {},
      );
      return groups;
    },
    {} as Record<string, Record<string, NormalizedLayoutStyle>>,
  );
};

const normalizeStacks = (
  input: StacksInput | undefined,
  spacing: Record<string, NormalizedScalarToken>,
): Record<string, NormalizedStack> => {
  if (!input) {
    return {} as Record<string, NormalizedStack>;
  }

  return Object.entries(input).reduce<Record<string, NormalizedStack>>(
    (acc, [name, definition]) => {
      acc[name] = normalizeStackVariant(`stacks.${name}`, definition, spacing);
      return acc;
    },
    {},
  );
};

const normalizeStackVariant = (
  label: string,
  definition: StackDefinition,
  spacing: Record<string, NormalizedScalarToken>,
): NormalizedStack => {
  return {
    direction: definition.direction ?? "column",
    align: definition.align,
    justify: definition.justify,
    wrap: definition.wrap,
    inline: definition.inline ?? false,
    gap: definition.gap
      ? resolveTokenReference(`${label}.gap`, definition.gap, "none", spacing)
      : undefined,
    responsive: (definition.responsive ?? []).map(entry => ({
      breakpoint: entry.breakpoint,
      query: entry.query ?? DEFAULT_RESPONSIVE_QUERY,
      direction: entry.direction,
      align: entry.align,
      justify: entry.justify,
      wrap: entry.wrap,
      inline: entry.inline,
    })),
  };
};

const normalizeGrids = (
  input: GridsInput | undefined,
  spacing: Record<string, NormalizedScalarToken>,
): Record<string, NormalizedGrid> => {
  if (!input) {
    return {} as Record<string, NormalizedGrid>;
  }

  return Object.entries(input).reduce<Record<string, NormalizedGrid>>(
    (acc, [name, definition]) => {
      acc[name] = normalizeGridVariant(`grids.${name}`, definition, spacing);
      return acc;
    },
    {},
  );
};

const normalizeGridVariant = (
  label: string,
  definition: GridDefinition,
  spacing: Record<string, NormalizedScalarToken>,
): NormalizedGrid => {
  const resolveGapValue = (sourceLabel: string, input: TokenValueInput | undefined) =>
    input ? resolveTokenReference(sourceLabel, input, "none", spacing).value : undefined;

  return {
    templateColumns: definition.templateColumns,
    templateRows: definition.templateRows,
    autoRows: definition.autoRows,
    autoColumns: definition.autoColumns,
    justifyItems: definition.justifyItems,
    alignItems: definition.alignItems,
    justifyContent: definition.justifyContent,
    alignContent: definition.alignContent,
    gap: definition.gap
      ? resolveTokenReference(`${label}.gap`, definition.gap, "none", spacing)
      : undefined,
    responsive: (definition.responsive ?? []).map(entry => ({
      breakpoint: entry.breakpoint,
      query: entry.query ?? DEFAULT_RESPONSIVE_QUERY,
      templateColumns: entry.templateColumns,
      templateRows: entry.templateRows,
      autoRows: entry.autoRows,
      autoColumns: entry.autoColumns,
      justifyItems: entry.justifyItems,
      alignItems: entry.alignItems,
      justifyContent: entry.justifyContent,
      alignContent: entry.alignContent,
      gap: resolveGapValue(`${label}.responsive`, entry.gap),
    })),
  };
};

const normalizeStyleVariant = (
  label: string,
  definition: LayoutStyleDefinition,
  spacing: Record<string, NormalizedScalarToken>,
): NormalizedLayoutStyle => {
  const values = resolveStyleValues(label, definition, spacing);
  const responsive = (definition.responsive ?? []).map(entry => ({
    breakpoint: entry.breakpoint,
    query: entry.query ?? DEFAULT_RESPONSIVE_QUERY,
    values: resolveStyleValues(`${label}.responsive`, entry, spacing),
  }));

  return {
    values,
    responsive,
  };
};

const resolveStyleValues = (
  label: string,
  definition: Omit<LayoutStyleDefinition, "responsive">,
  spacing: Record<string, NormalizedScalarToken>,
): LayoutStyleValues => ({
  marginY: definition.marginY
    ? resolveTokenReference(`${label}.marginY`, definition.marginY, "none", spacing)
    : undefined,
  marginX: definition.marginX
    ? resolveTokenReference(`${label}.marginX`, definition.marginX, "none", spacing)
    : undefined,
  paddingY: definition.paddingY
    ? resolveTokenReference(`${label}.paddingY`, definition.paddingY, "none", spacing)
    : undefined,
  paddingX: definition.paddingX
    ? resolveTokenReference(`${label}.paddingX`, definition.paddingX, "none", spacing)
    : undefined,
  gap: definition.gap
    ? resolveTokenReference(`${label}.gap`, definition.gap, "none", spacing)
    : undefined,
  background: definition.background,
});

const serializeScalarTokens = (
  prefix: string,
  category: string,
  tokens: Record<string, NormalizedScalarToken>,
): string[] => {
  const parts: string[] = [];

  for (const [name, token] of Object.entries(tokens)) {
    const segment = sanitizeSegment(name);
    parts.push(`${prefix}-${category}--${segment}: ${token.value};`);
    token.responsive.forEach(entry => {
      parts.push(
        `${prefix}-${category}--${segment}--${sanitizeSegment(entry.breakpoint)}: ${entry.value};`,
      );
    });
  }

  return parts;
};

const serializeColumns = (
  prefix: string,
  columns: NormalizedColumns,
): string[] => {
  const parts = [`${prefix}-grid-columns: ${columns.size};`];
  parts.push(`${prefix}-grid-column-gutter: ${columns.gutter.value};`);
  columns.gutter.responsive.forEach(entry => {
    parts.push(
      `${prefix}-grid-column-gutter--${sanitizeSegment(entry.breakpoint)}: ${entry.value};`,
    );
  });
  parts.push(`${prefix}-grid-column-inset: ${columns.inset.value};`);
  columns.inset.responsive.forEach(entry => {
    parts.push(
      `${prefix}-grid-column-inset--${sanitizeSegment(entry.breakpoint)}: ${entry.value};`,
    );
  });
  return parts;
};

const serializeContainers = <TBreakpoint extends string>(
  prefix: string,
  containers: Record<string, NormalizedContainer<TBreakpoint>>,
): string[] => {
  const parts: string[] = [];

  for (const [name, container] of Object.entries(containers)) {
    const segment = sanitizeSegment(name);
    for (const [breakpoint, width] of Object.entries(container.widths)) {
      parts.push(
        `${prefix}-container--${segment}--${sanitizeSegment(breakpoint)}-width: ${width};`,
      );
    }
    if (container.maxWidth) {
      parts.push(`${prefix}-container--${segment}-max-width: ${container.maxWidth};`);
    }
    parts.push(`${prefix}-container--${segment}-inset: ${container.inset.value};`);
    container.inset.responsive.forEach(entry => {
      parts.push(
        `${prefix}-container--${segment}-inset--${sanitizeSegment(entry.breakpoint)}: ${entry.value};`,
      );
    });
  }

  return parts;
};

const serializeStyles = (
  prefix: string,
  styles: Record<string, Record<string, NormalizedLayoutStyle>>,
): string[] => {
  const parts: string[] = [];
  const serializeValues = (
    group: string,
    variant: string,
    values: LayoutStyleValues,
    suffix = "",
  ) => {
    const base = `${prefix}-layout-${sanitizeSegment(group)}--${sanitizeSegment(
      variant,
    )}`;
    if (values.marginY) {
      parts.push(`${base}-margin-y${suffix}: ${values.marginY.value};`);
    }
    if (values.marginX) {
      parts.push(`${base}-margin-x${suffix}: ${values.marginX.value};`);
    }
    if (values.paddingY) {
      parts.push(`${base}-padding-y${suffix}: ${values.paddingY.value};`);
    }
    if (values.paddingX) {
      parts.push(`${base}-padding-x${suffix}: ${values.paddingX.value};`);
    }
    if (values.gap) {
      parts.push(`${base}-gap${suffix}: ${values.gap.value};`);
    }
    if (values.background) {
      parts.push(`${base}-background${suffix}: ${values.background};`);
    }
  };

  for (const [group, variants] of Object.entries(styles)) {
    for (const [variant, definition] of Object.entries(variants)) {
      serializeValues(group, variant, definition.values);
      definition.values.marginY?.responsive.forEach(entry => {
        parts.push(
          `${prefix}-layout-${sanitizeSegment(group)}--${sanitizeSegment(
            variant,
          )}-margin-y--${sanitizeSegment(entry.breakpoint)}: ${entry.value};`,
        );
      });
      definition.values.marginX?.responsive.forEach(entry => {
        parts.push(
          `${prefix}-layout-${sanitizeSegment(group)}--${sanitizeSegment(
            variant,
          )}-margin-x--${sanitizeSegment(entry.breakpoint)}: ${entry.value};`,
        );
      });
      definition.values.paddingY?.responsive.forEach(entry => {
        parts.push(
          `${prefix}-layout-${sanitizeSegment(group)}--${sanitizeSegment(
            variant,
          )}-padding-y--${sanitizeSegment(entry.breakpoint)}: ${entry.value};`,
        );
      });
      definition.values.paddingX?.responsive.forEach(entry => {
        parts.push(
          `${prefix}-layout-${sanitizeSegment(group)}--${sanitizeSegment(
            variant,
          )}-padding-x--${sanitizeSegment(entry.breakpoint)}: ${entry.value};`,
        );
      });
      definition.values.gap?.responsive.forEach(entry => {
        parts.push(
          `${prefix}-layout-${sanitizeSegment(group)}--${sanitizeSegment(
            variant,
          )}-gap--${sanitizeSegment(entry.breakpoint)}: ${entry.value};`,
        );
      });
      definition.responsive.forEach(entry => {
        const suffix = `--${sanitizeSegment(entry.breakpoint)}`;
        serializeValues(group, variant, entry.values, suffix);
      });
    }
  }

  return parts;
};

const buildBreakpointMetadata = <T extends string>(
  breakpoints: Breakpoints<T>,
) => {
  const keys = sortBreakpointKeys(breakpoints);
  const nextMap = keys.reduce((acc, key, index) => {
    acc[key] = keys[index + 1];
    return acc;
  }, {} as Record<T, T | undefined>);
  return { keys, nextMap };
};

const resolveMediaOptions = <T extends string>(
  breakpoint: string,
  query: ResponsiveQuery,
  breakpoints: Breakpoints<T>,
  nextMap: Record<T, T | undefined>,
): { min?: number; max?: number } | undefined => {
  const typed = breakpoint as T;
  const value = breakpoints[typed];
  if (value === undefined) {
    return undefined;
  }

  switch (query) {
    case "min":
      return { min: value };
    case "max":
      return { max: value };
    case "exact": {
      const nextKey = nextMap[typed];
      return {
        min: value,
        max: nextKey ? breakpoints[nextKey] : undefined,
      };
    }
    default:
      return { min: value };
  }
};

const wrapWithMedia = <T extends string>(
  breakpoints: Breakpoints<T>,
  nextMap: Record<T, T | undefined>,
  breakpoint: string,
  query: ResponsiveQuery,
  rule: string,
): string => {
  const options = resolveMediaOptions(
    breakpoint,
    query,
    breakpoints,
    nextMap,
  );

  if (!options || (!options.min && !options.max)) {
    return rule;
  }

  const mq = mediaQuery(options, MEDIA_CONFIG);
  if (!mq) {
    return rule;
  }

  return `${mq} {\n${rule}\n}`;
};

const appendResponsiveDeclarations = <T extends string>(
  parts: string[],
  selector: string,
  property: string,
  token: NormalizedScalarToken,
  breakpoints: Breakpoints<T>,
  nextMap: Record<T, T | undefined>,
) => {
  token.responsive.forEach(entry => {
    const declaration = `${selector} {\n  ${property}: ${entry.value};\n}`;
    parts.push(
      wrapWithMedia(
        breakpoints,
        nextMap,
        entry.breakpoint,
        entry.query ?? DEFAULT_RESPONSIVE_QUERY,
        declaration,
      ),
    );
  });
};

const serializeContainerClasses = <T extends string>(
  containers: Record<string, NormalizedContainer<T>>,
  breakpoints: Breakpoints<T>,
  classPrefix: string,
): string => {
  const parts: string[] = [];
  const { keys, nextMap } = buildBreakpointMetadata(breakpoints);

  for (const [name, container] of Object.entries(containers)) {
    const segment = sanitizeSegment(name);
    const selector = `.${classPrefix}-container-${segment}`;
    const declarations = [
      "box-sizing: border-box;",
      "width: 100%;",
      "margin-left: auto;",
      "margin-right: auto;",
      `padding-left: ${container.inset.value};`,
      `padding-right: ${container.inset.value};`,
    ];

    if (container.mode === "fixed") {
      const baseWidth = container.widths[keys[0]];
      if (baseWidth) {
        declarations.push(`max-width: ${baseWidth};`);
      }
    } else if (container.maxWidth) {
      declarations.push(`max-width: ${container.maxWidth};`);
    }

    parts.push(`${selector} {\n  ${declarations.join("\n  ")}\n}`);

    appendResponsiveDeclarations(
      parts,
      selector,
      "padding-left",
      container.inset,
      breakpoints,
      nextMap,
    );
    appendResponsiveDeclarations(
      parts,
      selector,
      "padding-right",
      container.inset,
      breakpoints,
      nextMap,
    );

    if (container.mode === "fixed") {
      keys.forEach((key, index) => {
        const width = container.widths[key];
        if (!width) {
          return;
        }
        if (index === 0) {
          return;
        }
        const rule = `${selector} {\n  max-width: ${width};\n}`;
        parts.push(wrapWithMedia(breakpoints, nextMap, key, "min", rule));
      });
    }
  }

  return parts.join("\n");
};

const buildStyleDeclarations = (values: LayoutStyleValues): string[] => {
  const declarations: string[] = [];
  if (values.marginY) {
    declarations.push(`margin-top: ${values.marginY.value};`);
    declarations.push(`margin-bottom: ${values.marginY.value};`);
  }
  if (values.marginX) {
    declarations.push(`margin-left: ${values.marginX.value};`);
    declarations.push(`margin-right: ${values.marginX.value};`);
  }
  if (values.paddingY) {
    declarations.push(`padding-top: ${values.paddingY.value};`);
    declarations.push(`padding-bottom: ${values.paddingY.value};`);
  }
  if (values.paddingX) {
    declarations.push(`padding-left: ${values.paddingX.value};`);
    declarations.push(`padding-right: ${values.paddingX.value};`);
  }
  if (values.gap) {
    declarations.push(`gap: ${values.gap.value};`);
  }
  if (values.background) {
    declarations.push(`background: ${values.background};`);
  }
  return declarations;
};

const appendStyleResponsiveTokens = <T extends string>(
  parts: string[],
  selector: string,
  property: string,
  token: NormalizedScalarToken | undefined,
  breakpoints: Breakpoints<T>,
  nextMap: Record<T, T | undefined>,
) => {
  if (!token) {
    return;
  }
  appendResponsiveDeclarations(parts, selector, property, token, breakpoints, nextMap);
};

const serializeLayoutStyleClasses = <T extends string>(
  styles: Record<string, Record<string, NormalizedLayoutStyle>>,
  breakpoints: Breakpoints<T>,
  classPrefix: string,
): string => {
  const parts: string[] = [];
  const { nextMap } = buildBreakpointMetadata(breakpoints);

  for (const [group, variants] of Object.entries(styles)) {
    const groupSegment = sanitizeSegment(group);
    for (const [variant, definition] of Object.entries(variants)) {
      const variantSegment = sanitizeSegment(variant);
      const selector = `.${classPrefix}-${groupSegment}-${variantSegment}`;
      const declarations = buildStyleDeclarations(definition.values);
      if (declarations.length) {
        parts.push(`${selector} {\n  ${declarations.join("\n  ")}\n}`);
      }

      appendStyleResponsiveTokens(
        parts,
        selector,
        "margin-top",
        definition.values.marginY,
        breakpoints,
        nextMap,
      );
      appendStyleResponsiveTokens(
        parts,
        selector,
        "margin-bottom",
        definition.values.marginY,
        breakpoints,
        nextMap,
      );
      appendStyleResponsiveTokens(
        parts,
        selector,
        "margin-left",
        definition.values.marginX,
        breakpoints,
        nextMap,
      );
      appendStyleResponsiveTokens(
        parts,
        selector,
        "margin-right",
        definition.values.marginX,
        breakpoints,
        nextMap,
      );
      appendStyleResponsiveTokens(
        parts,
        selector,
        "padding-top",
        definition.values.paddingY,
        breakpoints,
        nextMap,
      );
      appendStyleResponsiveTokens(
        parts,
        selector,
        "padding-bottom",
        definition.values.paddingY,
        breakpoints,
        nextMap,
      );
      appendStyleResponsiveTokens(
        parts,
        selector,
        "padding-left",
        definition.values.paddingX,
        breakpoints,
        nextMap,
      );
      appendStyleResponsiveTokens(
        parts,
        selector,
        "padding-right",
        definition.values.paddingX,
        breakpoints,
        nextMap,
      );
      appendStyleResponsiveTokens(
        parts,
        selector,
        "gap",
        definition.values.gap,
        breakpoints,
        nextMap,
      );

      definition.responsive.forEach(entry => {
        const responsiveDeclarations = buildStyleDeclarations(entry.values);
        if (!responsiveDeclarations.length) {
          return;
        }
        const rule = `${selector} {\n  ${responsiveDeclarations.join("\n  ")}\n}`;
        parts.push(
          wrapWithMedia(
            breakpoints,
            nextMap,
            entry.breakpoint,
            entry.query ?? DEFAULT_RESPONSIVE_QUERY,
            rule,
          ),
        );
      });
    }
  }

  return parts.join("\n");
};

const serializeStackClasses = <T extends string>(
  stacks: Record<string, NormalizedStack>,
  breakpoints: Breakpoints<T>,
  classPrefix: string,
): string => {
  const parts: string[] = [];
  const { nextMap } = buildBreakpointMetadata(breakpoints);

  for (const [name, stack] of Object.entries(stacks)) {
    const selector = `.${classPrefix}-stack-${sanitizeSegment(name)}`;
    const declarations: string[] = [
      `display: ${stack.inline ? "inline-flex" : "flex"};`,
      `flex-direction: ${stack.direction};`,
    ];
    if (stack.align) {
      declarations.push(`align-items: ${stack.align};`);
    }
    if (stack.justify) {
      declarations.push(`justify-content: ${stack.justify};`);
    }
    if (stack.wrap) {
      declarations.push(`flex-wrap: ${stack.wrap};`);
    }
    if (stack.gap) {
      declarations.push(`gap: ${stack.gap.value};`);
    }
    parts.push(`${selector} {\n  ${declarations.join("\n  ")}\n}`);

    if (stack.gap) {
      appendResponsiveDeclarations(parts, selector, "gap", stack.gap, breakpoints, nextMap);
    }

    stack.responsive.forEach(entry => {
      const rules: string[] = [];
      if (entry.inline !== undefined) {
        rules.push(`display: ${entry.inline ? "inline-flex" : "flex"};`);
      }
      if (entry.direction) {
        rules.push(`flex-direction: ${entry.direction};`);
      }
      if (entry.align) {
        rules.push(`align-items: ${entry.align};`);
      }
      if (entry.justify) {
        rules.push(`justify-content: ${entry.justify};`);
      }
      if (entry.wrap) {
        rules.push(`flex-wrap: ${entry.wrap};`);
      }
      if (!rules.length) {
        return;
      }
      parts.push(
        wrapWithMedia(
          breakpoints,
          nextMap,
          entry.breakpoint,
          entry.query ?? DEFAULT_RESPONSIVE_QUERY,
          `${selector} {\n  ${rules.join("\n  ")}\n}`,
        ),
      );
    });
  }

  return parts.join("\n");
};

const serializeGridClasses = <T extends string>(
  grids: Record<string, NormalizedGrid>,
  breakpoints: Breakpoints<T>,
  classPrefix: string,
): string => {
  const parts: string[] = [];
  const { nextMap } = buildBreakpointMetadata(breakpoints);

  for (const [name, grid] of Object.entries(grids)) {
    const selector = `.${classPrefix}-grid-${sanitizeSegment(name)}`;
    const declarations: string[] = ["display: grid;"];
    if (grid.templateColumns) {
      declarations.push(`grid-template-columns: ${grid.templateColumns};`);
    }
    if (grid.templateRows) {
      declarations.push(`grid-template-rows: ${grid.templateRows};`);
    }
    if (grid.autoRows) {
      declarations.push(`grid-auto-rows: ${grid.autoRows};`);
    }
    if (grid.autoColumns) {
      declarations.push(`grid-auto-columns: ${grid.autoColumns};`);
    }
    if (grid.justifyItems) {
      declarations.push(`justify-items: ${grid.justifyItems};`);
    }
    if (grid.alignItems) {
      declarations.push(`align-items: ${grid.alignItems};`);
    }
    if (grid.justifyContent) {
      declarations.push(`justify-content: ${grid.justifyContent};`);
    }
    if (grid.alignContent) {
      declarations.push(`align-content: ${grid.alignContent};`);
    }
    if (grid.gap) {
      declarations.push(`gap: ${grid.gap.value};`);
    }
    parts.push(`${selector} {\n  ${declarations.join("\n  ")}\n}`);

    if (grid.gap) {
      appendResponsiveDeclarations(parts, selector, "gap", grid.gap, breakpoints, nextMap);
    }

    grid.responsive.forEach(entry => {
      const rules: string[] = [];
      if (entry.templateColumns) {
        rules.push(`grid-template-columns: ${entry.templateColumns};`);
      }
      if (entry.templateRows) {
        rules.push(`grid-template-rows: ${entry.templateRows};`);
      }
      if (entry.autoRows) {
        rules.push(`grid-auto-rows: ${entry.autoRows};`);
      }
      if (entry.autoColumns) {
        rules.push(`grid-auto-columns: ${entry.autoColumns};`);
      }
      if (entry.justifyItems) {
        rules.push(`justify-items: ${entry.justifyItems};`);
      }
      if (entry.alignItems) {
        rules.push(`align-items: ${entry.alignItems};`);
      }
      if (entry.justifyContent) {
        rules.push(`justify-content: ${entry.justifyContent};`);
      }
      if (entry.alignContent) {
        rules.push(`align-content: ${entry.alignContent};`);
      }
      if (entry.gap) {
        rules.push(`gap: ${entry.gap};`);
      }
      if (!rules.length) {
        return;
      }
      parts.push(
        wrapWithMedia(
          breakpoints,
          nextMap,
          entry.breakpoint,
          entry.query ?? DEFAULT_RESPONSIVE_QUERY,
          `${selector} {\n  ${rules.join("\n  ")}\n}`,
        ),
      );
    });
  }

  return parts.join("\n");
};

const serializeSpacingUtilityClasses = <T extends string>(
  spacing: Record<string, NormalizedScalarToken>,
  breakpoints: Breakpoints<T>,
  classPrefix: string,
): string => {
  const parts: string[] = [];
  const { nextMap } = buildBreakpointMetadata(breakpoints);

  const pushClass = (segment: string, token: NormalizedScalarToken, label: string, properties: string[]) => {
    const selector = `.${classPrefix}-${label}-${segment}`;
    const declarations = properties.map(property => `${property}: ${token.value};`).join("\n  ");
    parts.push(`${selector} {\n  ${declarations}\n}`);
    properties.forEach(property => {
      appendResponsiveDeclarations(parts, selector, property, token, breakpoints, nextMap);
    });
  };

  for (const [name, token] of Object.entries(spacing)) {
    const segment = sanitizeSegment(name);
    pushClass(segment, token, "gap", ["gap"]);
    pushClass(segment, token, "py", ["padding-top", "padding-bottom"]);
    pushClass(segment, token, "px", ["padding-left", "padding-right"]);
    pushClass(segment, token, "my", ["margin-top", "margin-bottom"]);
    pushClass(segment, token, "mx", ["margin-left", "margin-right"]);
  }

  return parts.join("\n");
};

const buildResponsiveRulesForToken = <T extends string>(
  token: NormalizedScalarToken | undefined,
  breakpoints: Breakpoints<T>,
  nextMap: Record<T, T | undefined>,
  builder: (value: string) => string,
): string[] => {
  if (!token) {
    return [];
  }

  return token.responsive.map(entry =>
    wrapWithMedia(
      breakpoints,
      nextMap,
      entry.breakpoint,
      entry.query ?? DEFAULT_RESPONSIVE_QUERY,
      builder(entry.value),
    ),
  );
};

const createMixin = (sections: string[]): ReturnType<typeof css> => {
  const content = sections.filter(Boolean).join("\n");
  const mixin = content ? css`${content}` : css``;
  Object.defineProperty(mixin, "toString", {
    value: () => content,
    configurable: true,
  });
  return mixin;
};

const createColumnsMixin = <T extends string>(
  columns: NormalizedColumns,
  breakpoints: Breakpoints<T>,
): ReturnType<typeof css> => {
  const sections: string[] = [];
  sections.push(
    [
      "display: grid;",
      `grid-template-columns: repeat(${columns.size}, minmax(0, 1fr));`,
      `column-gap: ${columns.gutter.value};`,
      `row-gap: ${columns.gutter.value};`,
      `padding-left: ${columns.inset.value};`,
      `padding-right: ${columns.inset.value};`,
    ].join("\n"),
  );

  const { nextMap } = buildBreakpointMetadata(breakpoints);
  sections.push(
    ...buildResponsiveRulesForToken(
      columns.gutter,
      breakpoints,
      nextMap,
      value => `column-gap: ${value};\nrow-gap: ${value};`,
    ),
    ...buildResponsiveRulesForToken(
      columns.inset,
      breakpoints,
      nextMap,
      value => `padding-left: ${value};\npadding-right: ${value};`,
    ),
  );

  return createMixin(sections);
};

const createContainerMixin = <T extends string>(
  container: NormalizedContainer<T>,
  breakpoints: Breakpoints<T>,
): ReturnType<typeof css> => {
  const sections: string[] = [];
  const { keys, nextMap } = buildBreakpointMetadata(breakpoints);

  const declarations = [
    "box-sizing: border-box;",
    "width: 100%;",
    "margin-left: auto;",
    "margin-right: auto;",
    `padding-left: ${container.inset.value};`,
    `padding-right: ${container.inset.value};`,
  ];

  if (container.mode === "fixed") {
    const baseWidth = container.widths[keys[0]];
    if (baseWidth) {
      declarations.push(`max-width: ${baseWidth};`);
    }
  } else if (container.maxWidth) {
    declarations.push(`max-width: ${container.maxWidth};`);
  }

  sections.push(declarations.join("\n"));

  sections.push(
    ...buildResponsiveRulesForToken(
      container.inset,
      breakpoints,
      nextMap,
      value => `padding-left: ${value};\npadding-right: ${value};`,
    ),
  );

  if (container.mode === "fixed") {
    keys.slice(1).forEach(key => {
      const width = container.widths[key];
      if (!width) {
        return;
      }
      sections.push(wrapWithMedia(breakpoints, nextMap, key, "min", `max-width: ${width};`));
    });
  }

  return createMixin(sections);
};

const createStyleMixin = <T extends string>(
  style: NormalizedLayoutStyle,
  breakpoints: Breakpoints<T>,
): ReturnType<typeof css> => {
  const sections: string[] = [];
  sections.push(buildStyleDeclarations(style.values).join("\n"));

  const { nextMap } = buildBreakpointMetadata(breakpoints);
  sections.push(
    ...buildResponsiveRulesForToken(
      style.values.marginY,
      breakpoints,
      nextMap,
      value => `margin-top: ${value};\nmargin-bottom: ${value};`,
    ),
    ...buildResponsiveRulesForToken(
      style.values.marginX,
      breakpoints,
      nextMap,
      value => `margin-left: ${value};\nmargin-right: ${value};`,
    ),
    ...buildResponsiveRulesForToken(
      style.values.paddingY,
      breakpoints,
      nextMap,
      value => `padding-top: ${value};\npadding-bottom: ${value};`,
    ),
    ...buildResponsiveRulesForToken(
      style.values.paddingX,
      breakpoints,
      nextMap,
      value => `padding-left: ${value};\npadding-right: ${value};`,
    ),
    ...buildResponsiveRulesForToken(
      style.values.gap,
      breakpoints,
      nextMap,
      value => `gap: ${value};`,
    ),
  );

  style.responsive.forEach(entry => {
    const block = buildStyleDeclarations(entry.values).join("\n");
    if (!block) {
      return;
    }
    sections.push(
      wrapWithMedia(
        breakpoints,
        nextMap,
        entry.breakpoint,
        entry.query ?? DEFAULT_RESPONSIVE_QUERY,
        block,
      ),
    );
  });

  return createMixin(sections);
};

const createStackMixin = <T extends string>(
  stack: NormalizedStack,
  breakpoints: Breakpoints<T>,
): ReturnType<typeof css> => {
  const sections: string[] = [];
  const declarations: string[] = [
    `display: ${stack.inline ? "inline-flex" : "flex"};`,
    `flex-direction: ${stack.direction};`,
  ];
  if (stack.align) {
    declarations.push(`align-items: ${stack.align};`);
  }
  if (stack.justify) {
    declarations.push(`justify-content: ${stack.justify};`);
  }
  if (stack.wrap) {
    declarations.push(`flex-wrap: ${stack.wrap};`);
  }
  if (stack.gap) {
    declarations.push(`gap: ${stack.gap.value};`);
  }
  sections.push(declarations.join("\n"));

  const { nextMap } = buildBreakpointMetadata(breakpoints);
  if (stack.gap) {
    sections.push(
      ...buildResponsiveRulesForToken(
        stack.gap,
        breakpoints,
        nextMap,
        value => `gap: ${value};`,
      ),
    );
  }

  stack.responsive.forEach(entry => {
    const rules: string[] = [];
    if (entry.inline !== undefined) {
      rules.push(`display: ${entry.inline ? "inline-flex" : "flex"};`);
    }
    if (entry.direction) {
      rules.push(`flex-direction: ${entry.direction};`);
    }
    if (entry.align) {
      rules.push(`align-items: ${entry.align};`);
    }
    if (entry.justify) {
      rules.push(`justify-content: ${entry.justify};`);
    }
    if (entry.wrap) {
      rules.push(`flex-wrap: ${entry.wrap};`);
    }
    if (!rules.length) {
      return;
    }
    sections.push(
      wrapWithMedia(
        breakpoints,
        nextMap,
        entry.breakpoint,
        entry.query ?? DEFAULT_RESPONSIVE_QUERY,
        rules.join("\n"),
      ),
    );
  });

  return createMixin(sections);
};

const createGridMixin = <T extends string>(
  grid: NormalizedGrid,
  breakpoints: Breakpoints<T>,
): ReturnType<typeof css> => {
  const sections: string[] = [];
  const declarations: string[] = ["display: grid;"];
  if (grid.templateColumns) {
    declarations.push(`grid-template-columns: ${grid.templateColumns};`);
  }
  if (grid.templateRows) {
    declarations.push(`grid-template-rows: ${grid.templateRows};`);
  }
  if (grid.autoRows) {
    declarations.push(`grid-auto-rows: ${grid.autoRows};`);
  }
  if (grid.autoColumns) {
    declarations.push(`grid-auto-columns: ${grid.autoColumns};`);
  }
  if (grid.justifyItems) {
    declarations.push(`justify-items: ${grid.justifyItems};`);
  }
  if (grid.alignItems) {
    declarations.push(`align-items: ${grid.alignItems};`);
  }
  if (grid.justifyContent) {
    declarations.push(`justify-content: ${grid.justifyContent};`);
  }
  if (grid.alignContent) {
    declarations.push(`align-content: ${grid.alignContent};`);
  }
  if (grid.gap) {
    declarations.push(`gap: ${grid.gap.value};`);
  }
  sections.push(declarations.join("\n"));

  const { nextMap } = buildBreakpointMetadata(breakpoints);
  if (grid.gap) {
    sections.push(
      ...buildResponsiveRulesForToken(
        grid.gap,
        breakpoints,
        nextMap,
        value => `gap: ${value};`,
      ),
    );
  }

  grid.responsive.forEach(entry => {
    const rules: string[] = [];
    if (entry.templateColumns) {
      rules.push(`grid-template-columns: ${entry.templateColumns};`);
    }
    if (entry.templateRows) {
      rules.push(`grid-template-rows: ${entry.templateRows};`);
    }
    if (entry.autoRows) {
      rules.push(`grid-auto-rows: ${entry.autoRows};`);
    }
    if (entry.autoColumns) {
      rules.push(`grid-auto-columns: ${entry.autoColumns};`);
    }
    if (entry.justifyItems) {
      rules.push(`justify-items: ${entry.justifyItems};`);
    }
    if (entry.alignItems) {
      rules.push(`align-items: ${entry.alignItems};`);
    }
    if (entry.justifyContent) {
      rules.push(`justify-content: ${entry.justifyContent};`);
    }
    if (entry.alignContent) {
      rules.push(`align-content: ${entry.alignContent};`);
    }
    if (entry.gap) {
      rules.push(`gap: ${entry.gap};`);
    }
    if (!rules.length) {
      return;
    }
    sections.push(
      wrapWithMedia(
        breakpoints,
        nextMap,
        entry.breakpoint,
        entry.query ?? DEFAULT_RESPONSIVE_QUERY,
        rules.join("\n"),
      ),
    );
  });

  return createMixin(sections);
};

const serializeColumnClasses = <T extends string>(
  columns: NormalizedColumns,
  breakpoints: Breakpoints<T>,
  classPrefix: string,
): string => {
  const parts: string[] = [];
  const { keys } = buildBreakpointMetadata(breakpoints);
  const spans = Array.from({ length: columns.size }, (_, index) => index + 1);

  keys.forEach(key => {
    const min = breakpoints[key];
    const rules = spans
      .map(span => {
        const segment = sanitizeSegment(key);
        const className = `.${classPrefix}-col-${segment}-${span}`;
        const offsetClass = `.${classPrefix}-offset-${segment}-${span}`;
        return `${className} {\n  grid-column-end: span ${span};\n}\n${offsetClass} {\n  grid-column-start: ${span + 1};\n}`;
      })
      .join("\n");

    if (!min) {
      parts.push(rules);
      return;
    }

    parts.push(`@media (min-width: ${min}px) {\n${rules}\n}`);
  });

  return parts.join("\n");
};

export function buildGridTokens<TBreakpoint extends string>(
  source: GridSource<TBreakpoint>,
  breakpoints: Breakpoints<TBreakpoint>,
  options?: LayoutBuilderOptions,
): {
  tokens: LayoutTokens<TBreakpoint>;
  helpers: LayoutHelpers<TBreakpoint>;
  toCSS: () => string;
} {
  const layout = source.layout;
  const prefix = normalizePrefix(options?.prefix);
  const classPrefix = normalizeClassPrefix(options?.classPrefix, prefix);

  const spacing = normalizeTokenMap("spacing", layout.spacing, { ensureNone: true });
  const gutters = normalizeTokenMap("gutters", ensureRecord(layout.gutters, { default: "none" }), {
    ensureNone: true,
  });
  const columns = normalizeColumns(layout.columns, spacing);
  const containers = normalizeContainers(layout.containers, spacing, breakpoints);
  const styles = normalizeStyles(layout.styles, spacing);
  const stacks = normalizeStacks(layout.stacks, spacing);
  const grids = normalizeGrids(layout.grids, spacing);

  const tokens: LayoutTokens<TBreakpoint> = {
    spacing,
    gutters,
    columns,
    containers,
    styles,
    stacks,
    grids,
  };

  const helpers: LayoutHelpers<TBreakpoint> = {
    spacing: token => tokens.spacing[token],
    gutter: token => tokens.gutters[token],
    buildColumns: () => tokens.columns,
    buildContainer: name => tokens.containers[name],
    layout: (group, variant) => tokens.styles[group]?.[variant],
    stack: name => tokens.stacks[name],
    grid: name => tokens.grids[name],
    columnsMixin: () => createColumnsMixin(tokens.columns, breakpoints),
    containerMixin: name => {
      const container = tokens.containers[name];
      if (!container) {
        return undefined;
      }
      return createContainerMixin(container, breakpoints);
    },
    styleMixin: (group, variant) => {
      const definition = tokens.styles[group]?.[variant];
      if (!definition) {
        return undefined;
      }
      return createStyleMixin(definition, breakpoints);
    },
    stackMixin: name => {
      const definition = tokens.stacks[name];
      if (!definition) {
        return undefined;
      }
      return createStackMixin(definition, breakpoints);
    },
    gridMixin: name => {
      const definition = tokens.grids[name];
      if (!definition) {
        return undefined;
      }
      return createGridMixin(definition, breakpoints);
    },
    classPrefix,
  };

  const toCSS = () => {
    const parts: string[] = [];
    parts.push(...serializeScalarTokens(prefix, "spacing", tokens.spacing));
    parts.push(...serializeScalarTokens(prefix, "gutter", tokens.gutters));
    parts.push(...serializeColumns(prefix, tokens.columns));
    parts.push(...serializeContainers(prefix, tokens.containers));
    parts.push(...serializeStyles(prefix, tokens.styles));
    const columnClasses = serializeColumnClasses(tokens.columns, breakpoints, classPrefix);
    if (columnClasses) {
      parts.push(columnClasses);
    }
    const containerClasses = serializeContainerClasses(tokens.containers, breakpoints, classPrefix);
    if (containerClasses) {
      parts.push(containerClasses);
    }
    const layoutStyleClasses = serializeLayoutStyleClasses(tokens.styles, breakpoints, classPrefix);
    if (layoutStyleClasses) {
      parts.push(layoutStyleClasses);
    }
    const stackClasses = serializeStackClasses(tokens.stacks, breakpoints, classPrefix);
    if (stackClasses) {
      parts.push(stackClasses);
    }
    const gridClasses = serializeGridClasses(tokens.grids, breakpoints, classPrefix);
    if (gridClasses) {
      parts.push(gridClasses);
    }
    const spacingClasses = serializeSpacingUtilityClasses(tokens.spacing, breakpoints, classPrefix);
    if (spacingClasses) {
      parts.push(spacingClasses);
    }
    return parts.join("\n");
  };

  return { tokens, helpers, toCSS };
}
