import type { Breakpoints } from "../types";
import type { MediaQueryOptions } from "./queries";

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

export const buildMediaDescriptor = <TBreakpoint extends string>(
  breakpoints: Breakpoints<TBreakpoint>,
  resolveQuery: (
    options: MediaQueryOptions,
  ) => string,
): MediaDescriptor<TBreakpoint> => {
  const keys = sortBreakpointKeys(breakpoints);
  const groups = keys.reduce<Record<TBreakpoint, MediaGroupDescriptor>>(
    (acc, key, index) => {
      const min = breakpoints[key];
      const nextKey = keys[index + 1];
      const max = nextKey ? breakpoints[nextKey] : undefined;

      acc[key] = buildGroupDescriptor({ min, max }, resolveQuery);
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
    const max = breakpoints[to];

    if (min === undefined || max === undefined) {
      throw new Error(
        `Cannot build media query between "${from}" and "${to}" breakpoints.`,
      );
    }

    return resolveQuery({ min, max, ...options });
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
      return resolveQuery({ max: breakpoints[key], ...options });
    },
    between,
  };
};

const buildGroupDescriptor = (
  { min, max }: { min?: number; max?: number },
  resolveQuery: (options: MediaQueryOptions) => string,
): MediaGroupDescriptor => ({
  min: resolveQuery({ min }),
  max: resolveQuery({ max }),
  exact: resolveQuery({ min, max }),
});
