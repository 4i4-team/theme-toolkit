import type { Breakpoints } from "../common/types";
import type { MediaQueryOptions } from "./queries";

export const BREAKPOINT_EPSILON = 0.02;

export type MediaVariant = "min" | "max" | "exact";

export type MediaGroupDescriptor = Record<MediaVariant, string>;

export type MediaDescriptor<TBreakpoint extends string> = {
  groups: Record<TBreakpoint, MediaGroupDescriptor>;
  min: (key: TBreakpoint, options?: MediaQueryOptions) => string;
  max: (key: TBreakpoint, options?: MediaQueryOptions) => string;
  between: (
    from: TBreakpoint,
    to: TBreakpoint,
    options?: MediaQueryOptions,
  ) => string;
};

export const sortBreakpointKeys = <T extends string>(
  breakpoints: Breakpoints<T>,
): T[] => (Object.keys(breakpoints) as T[]).sort(
  (a, b) => breakpoints[a] - breakpoints[b],
);

const maxValueForNext = (next?: number): number | undefined =>
  next === undefined ? undefined : next - BREAKPOINT_EPSILON;

export const buildMediaDescriptor = <TBreakpoint extends string>(
  breakpoints: Breakpoints<TBreakpoint>,
  resolveQuery: (
    options: MediaQueryOptions,
  ) => string,
): MediaDescriptor<TBreakpoint> => {
  const keys = sortBreakpointKeys(breakpoints);
  const nextOf = (key: TBreakpoint): TBreakpoint | undefined =>
    keys[keys.indexOf(key) + 1];

  const groups = keys.reduce<Record<TBreakpoint, MediaGroupDescriptor>>(
    (acc, key) => {
      const own = breakpoints[key];
      const nextKey = nextOf(key);
      const next = nextKey !== undefined ? breakpoints[nextKey] : undefined;

      acc[key] = buildGroupDescriptor({ own, next }, resolveQuery);
      return acc;
    },
    {} as Record<TBreakpoint, MediaGroupDescriptor>,
  );

  const resolveKey = (key: TBreakpoint): MediaGroupDescriptor => {
    const group = groups[key];
    if (!group) {
      throw new Error(`Breakpoint "${key}" is not defined.`);
    }
    return group;
  };

  const between = (
    from: TBreakpoint,
    to: TBreakpoint,
    options?: MediaQueryOptions,
  ): string => {
    const min = breakpoints[from];
    const toValue = breakpoints[to];

    if (min === undefined || toValue === undefined) {
      throw new Error(
        `Cannot build media query between "${from}" and "${to}" breakpoints.`,
      );
    }

    return resolveQuery({ min, max: toValue - BREAKPOINT_EPSILON, ...options });
  };

  return {
    groups,
    min: (key, options) => {
      const group = resolveKey(key);
      if (!options) {
        return group.min;
      }
      return resolveQuery({ min: breakpoints[key], ...options });
    },
    max: (key, options) => {
      const group = resolveKey(key);
      if (!options) {
        return group.max;
      }
      const nextKey = nextOf(key);
      const next = nextKey !== undefined ? breakpoints[nextKey] : undefined;
      return resolveQuery({ max: maxValueForNext(next), ...options });
    },
    between,
  };
};

const buildGroupDescriptor = (
  { own, next }: { own: number; next?: number },
  resolveQuery: (options: MediaQueryOptions) => string,
): MediaGroupDescriptor => {
  const maxValue = maxValueForNext(next);
  return {
    min: resolveQuery({ min: own }),
    max: maxValue === undefined ? "" : resolveQuery({ max: maxValue }),
    exact: resolveQuery({ min: own, max: maxValue }),
  };
};
