import { css } from "styled-components";
import { Interpolation } from "styled-components/dist/types";
import type { Breakpoints } from "../../core/common";
import {
  buildMediaDescriptor,
  mediaQueryString,
  resolveMediaConfig,
} from "../../core/media";
import type { MediaConfig, MediaDescriptor, MediaGroupDescriptor, MediaQueryOptions, MediaVariant } from "../../core/media";

type MediaTemplate = (
  styles: TemplateStringsArray,
  ...interpolations: Interpolation<object>[]
) => ReturnType<typeof css>;

type MediaTemplateWithQuery = MediaTemplate & { readonly query: string };

export type WrappedMediaGroup = Record<MediaVariant, MediaTemplateWithQuery>;

export type WrappedMediaDescriptor<TBreakpoint extends string> = {
  min: (key: TBreakpoint, options?: MediaOrientationOptions) => MediaTemplateWithQuery;
  max: (key: TBreakpoint, options?: MediaOrientationOptions) => MediaTemplateWithQuery;
  between: (
    from: TBreakpoint,
    to: TBreakpoint,
    options?: MediaOrientationOptions,
  ) => MediaTemplateWithQuery;
} & Record<TBreakpoint, WrappedMediaGroup>;

type MediaOrientationOptions = Pick<MediaQueryOptions, "orientation">;

const RESERVED_DESCRIPTOR_KEYS = new Set(["min", "max", "between"]);

export const wrapMediaDescriptor = <TBreakpoint extends string>(
  descriptor: MediaDescriptor<TBreakpoint>,
): WrappedMediaDescriptor<TBreakpoint> => {
  const wrapped = {
    min: (key: TBreakpoint, options?: MediaOrientationOptions) =>
      wrapQuery(descriptor.min(key, options)),
    max: (key: TBreakpoint, options?: MediaOrientationOptions) =>
      wrapQuery(descriptor.max(key, options)),
    between: (
      from: TBreakpoint,
      to: TBreakpoint,
      options?: MediaOrientationOptions,
    ) => wrapQuery(descriptor.between(from, to, options)),
  } as WrappedMediaDescriptor<TBreakpoint>;

  for (const key of Object.keys(descriptor) as TBreakpoint[]) {
    if (RESERVED_DESCRIPTOR_KEYS.has(key)) continue;
    (wrapped as Record<string, unknown>)[key] = wrapMediaGroup(
      descriptor[key] as MediaGroupDescriptor,
    );
  }

  return wrapped;
};

export const wrapMediaGroup = (group: MediaGroupDescriptor): WrappedMediaGroup => {
  const wrapped = {} as WrappedMediaGroup;
  (Object.keys(group) as MediaVariant[]).forEach(variant => {
    wrapped[variant] = wrapQuery(group[variant]);
  });
  return wrapped;
};

const wrapQuery = (query: string): MediaTemplateWithQuery => {
  const template = buildTemplate(query);
  return Object.assign(template, { query }) as MediaTemplateWithQuery;
};

const buildTemplate = (query: string): MediaTemplate => {
  if (!query) {
    return (styles, ...interpolations) => css`
      ${css(styles, ...interpolations)}
    `;
  }

  return (styles, ...interpolations) => css`
    ${query} {
      ${css(styles, ...interpolations)}
    }
  `;
};

// SC-specific types
export type MediaGroup = WrappedMediaGroup;
export type MediaHelpers<T extends string> = WrappedMediaDescriptor<T>;

export type ThemeWithMedia<T extends string> = {
  readonly media: MediaHelpers<T>;
};

// SC-wrapped media factory
export const media = <T extends string>(
  breakpoints: Breakpoints<T>,
  config?: MediaConfig,
): MediaHelpers<T> => {
  const normalizedConfig = resolveMediaConfig(config);
  const descriptor = buildMediaDescriptor(breakpoints, options =>
    mediaQueryString(options, normalizedConfig),
  );
  return wrapMediaDescriptor(descriptor) as MediaHelpers<T>;
};

export const breakpoint = ({
  min,
  max,
  config,
}: {
  min?: number;
  max?: number;
  config?: MediaConfig;
}): MediaGroup => {
  const resolved = resolveMediaConfig(config);
  return wrapMediaGroup({
    min: mediaQueryString({ min }, resolved),
    max: mediaQueryString({ max }, resolved),
    exact: mediaQueryString({ min, max }, resolved),
  });
};
