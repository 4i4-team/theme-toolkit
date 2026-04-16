import type { ResponsiveQuery } from "../common";

type Scalar = number | string;

export type RadiusValue = Scalar;

type ResponsiveTokenInput =
  | Scalar
  | {
      value?: Scalar;
      token?: string;
      responsive?: Array<{
        breakpoint: string;
        query?: ResponsiveQuery;
        value?: Scalar;
        token?: string;
      }>;
    };

export type RadiusInput = Scalar | Record<string, ResponsiveTokenInput>;

export type NormalizedResponsiveToken = {
  value: string;
  responsive: Array<{
    breakpoint: string;
    query: ResponsiveQuery;
    value: string;
  }>;
};

type NormalizedRadiusToken = NormalizedResponsiveToken;

export type ElevationValue = string;

export type ElevationToken =
  | ElevationValue
  | {
      value: ElevationValue;
    };

export type ShadowToken = {
  inset?: boolean;
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
};

export type BlurInput = Scalar | Record<string, ResponsiveTokenInput>;

export type ZIndexInput = Scalar | Record<string, ResponsiveTokenInput>;

export type OpacityInput = Scalar | Record<string, ResponsiveTokenInput>;

export type TransitionToken = {
  duration: string;
  timing?: string;
};

export type EffectsConfig = {
  radius?: RadiusInput;
  styles?: Record<string, Record<string, EffectStyleDefinition>>;
  shadows?: Record<string, ShadowToken | ShadowToken[]>;
  blur?: BlurInput;
  zIndex?: ZIndexInput;
  opacity?: OpacityInput;
  transitions?: Record<string, TransitionToken>;
};

export type EffectStyleValues = {
  radius?: string;
  shadow?: string;
  background?: string;
  zIndex?: number;
  blur?: string;
  opacity?: number;
};

export type EffectStyleDefinition = EffectStyleValues & {
  responsive?: Array<{
    breakpoint: string;
    query?: ResponsiveQuery;
  } & EffectStyleValues>;
};

export type NormalizedEffectStyle = {
  values: EffectStyleValues;
  responsive: Array<{
    breakpoint: string;
    query: ResponsiveQuery;
    values: EffectStyleValues;
  }>;
};

export type EffectsTokens = {
  radius: Record<string, NormalizedRadiusToken>;
  styles: Record<string, Record<string, NormalizedEffectStyle>>;
  shadows: Record<string, string>;
  blur: Record<string, NormalizedResponsiveToken>;
  zIndex: Record<string, NormalizedResponsiveToken>;
  opacity: Record<string, NormalizedResponsiveToken>;
  transitions: Record<string, TransitionToken>;
};

const formatScalar = (value: Scalar) => (typeof value === "number" ? `${value}px` : value);

const normalizeResponsiveTokens = (
  input: Scalar | Record<string, ResponsiveTokenInput> | undefined,
  label: string,
  { ensureNoneValue }: { ensureNoneValue?: Scalar } = {},
): Record<string, NormalizedResponsiveToken> => {
  if (input === undefined) {
    return {};
  }

  const rawEntries: Record<string, ResponsiveTokenInput> = {};

  if (typeof input === "number" || typeof input === "string") {
    rawEntries.default = input;
  } else {
    Object.assign(rawEntries, input);
  }

  if (ensureNoneValue !== undefined && rawEntries.none === undefined) {
    rawEntries.none = ensureNoneValue;
  }

  if (rawEntries.default === undefined) {
    throw new Error(`Missing "default" entry for ${label} tokens.`);
  }

  const resolved = new Map<string, NormalizedResponsiveToken>();
  const resolving = new Set<string>();

  const resolveEntry = (key: string): NormalizedResponsiveToken => {
    if (resolved.has(key)) {
      return resolved.get(key)!;
    }

    if (resolving.has(key)) {
      throw new Error(`Circular ${label} token reference detected for "${key}".`);
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

  const resolveReference = (token: string, current: string): NormalizedResponsiveToken => {
    if (!(token in rawEntries)) {
      throw new Error(`Unknown ${label} token reference "${token}" from "${current}".`);
    }
    if (token === current) {
      throw new Error(`Self reference detected in ${label} token "${current}".`);
    }
    return resolveEntry(token);
  };

  const resolveScalar = (value: Scalar, current: string): string => {
    if (typeof value === "string" && rawEntries[value] !== undefined) {
      return resolveReference(value, current).value;
    }
    return formatScalar(value);
  };

  const normalizeValue = (
    raw: ResponsiveTokenInput,
    current: string,
  ): NormalizedResponsiveToken => {
    if (typeof raw === "number" || typeof raw === "string") {
      return {
        value: formatScalar(raw),
        responsive: [],
      };
    }

    const base = raw.value !== undefined
      ? resolveScalar(raw.value, current)
      : raw.token
        ? resolveReference(raw.token, current).value
        : resolveEntry("default").value;

    const responsive = (raw.responsive ?? []).map(entry => {
      const value = entry.value !== undefined
        ? resolveScalar(entry.value, current)
        : entry.token
          ? resolveReference(entry.token, current).value
          : base;
      return {
        breakpoint: entry.breakpoint,
        query: entry.query ?? "min",
        value,
      };
    });

    return {
      value: base,
      responsive,
    };
  };

  Object.keys(rawEntries).forEach(resolveEntry);

  return Object.fromEntries(resolved);
};

const normalizeRadius = (input: RadiusInput | undefined) =>
  normalizeResponsiveTokens(input, "radius", { ensureNoneValue: 0 });

const normalizeElevation = (
  elevation: Record<string, ElevationToken> | undefined,
): Record<string, ElevationValue> => {
  if (!elevation) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(elevation).map(([name, token]) => [name, typeof token === "object" ? token.value : token]),
  );
};

const normalizeShadows = (
  shadows: Record<string, ShadowToken | ShadowToken[]> | undefined,
): Record<string, string> => {
  if (!shadows) {
    return {};
  }
  const toString = (shadow: ShadowToken) =>
    `${shadow.inset ? "inset " : ""}${shadow.offsetX} ${shadow.offsetY} ${shadow.blur} ${shadow.spread} ${shadow.color}`;
  return Object.fromEntries(
    Object.entries(shadows).map(([name, token]) => [
      name,
      Array.isArray(token) ? token.map(toString).join(", ") : toString(token),
    ]),
  );
};

const ensureRecord = <T>(value: Record<string, T> | undefined): Record<string, T> => value ?? {};

export const buildEffectsTokens = (config: EffectsConfig | undefined): EffectsTokens => {
  const radius = normalizeRadius(config?.radius);
  const shadows = normalizeShadows(config?.shadows);
  const blur = normalizeResponsiveTokens(config?.blur, "blur", { ensureNoneValue: 0 });
  const zIndex = normalizeResponsiveTokens(config?.zIndex, "zIndex", { ensureNoneValue: 0 });
  const opacity = normalizeResponsiveTokens(config?.opacity, "opacity", { ensureNoneValue: 0 });
  const transitions = ensureRecord(config?.transitions);

  return {
    radius,
    styles: {},
    shadows,
    blur,
    zIndex,
    opacity,
    transitions,
  };
};
