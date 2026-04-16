import { css } from "styled-components";
import { Interpolation } from "styled-components/dist/types";
import type { MediaDescriptor, MediaGroupDescriptor, MediaVariant, MediaQueryOptions } from "../../core/media";

type MediaTemplate = (
  styles: TemplateStringsArray,
  ...interpolations: Interpolation<object>[]
) => ReturnType<typeof css>;

type MediaTemplateWithQuery = MediaTemplate & { readonly query: string };

export type WrappedMediaGroup = Record<MediaVariant, MediaTemplateWithQuery>;

export type WrappedMediaGroups<TBreakpoint extends string> = Record<
  TBreakpoint,
  WrappedMediaGroup
>;

export type WrappedMediaDescriptor<TBreakpoint extends string> = {
  groups: WrappedMediaGroups<TBreakpoint>;
  min: (key: TBreakpoint, options?: MediaOrientationOptions) => MediaTemplateWithQuery;
  max: (key: TBreakpoint, options?: MediaOrientationOptions) => MediaTemplateWithQuery;
  between: (
    from: TBreakpoint,
    to: TBreakpoint,
    options?: MediaOrientationOptions,
  ) => MediaTemplateWithQuery;
};

type MediaOrientationOptions = Pick<MediaQueryOptions, "orientation">;

export const wrapMediaDescriptor = <TBreakpoint extends string>(
  descriptor: MediaDescriptor<TBreakpoint>,
): WrappedMediaDescriptor<TBreakpoint> => {
  const groups = {} as WrappedMediaGroups<TBreakpoint>;
  for (const key of Object.keys(descriptor.groups) as TBreakpoint[]) {
    groups[key] = wrapMediaGroup(descriptor.groups[key]);
  }

  return {
    groups,
    min: (key, options) => wrapQuery(descriptor.min(key, options)),
    max: (key, options) => wrapQuery(descriptor.max(key, options)),
    between: (from, to, options) => wrapQuery(descriptor.between(from, to, options)),
  };
};

const wrapGroup = (group: MediaGroupDescriptor): WrappedMediaGroup => {
  const wrapped = {} as WrappedMediaGroup;
  (Object.keys(group) as MediaVariant[]).forEach(variant => {
    wrapped[variant] = wrapQuery(group[variant]);
  });
  return wrapped;
};

export const wrapMediaGroup = (group: MediaGroupDescriptor): WrappedMediaGroup =>
  wrapGroup(group);

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
