import {
  buildMediaDescriptor,
  mediaQueryString,
  resolveMediaConfig,
  MediaQueryOptions,
  MediaConfig,
  MediaUnit,
} from "../../core/media";
import type { Breakpoints } from "../../core/common";
import {
  wrapMediaDescriptor,
  wrapMediaGroup,
  WrappedMediaDescriptor,
  WrappedMediaGroup,
} from "./templates";

export type { MediaConfig, MediaUnit, MediaQueryOptions };

export type ThemeWithMedia<T extends string> = {
  readonly media: MediaHelpers<T>;
};

export type DefaultBreakpointKey = "xs" | "sm" | "md" | "lg" | "xl";
export type DefaultBreakpoints = Breakpoints<DefaultBreakpointKey>;

export const DEFAULT_BREAKPOINTS: DefaultBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1280,
};

export type MediaGroup = WrappedMediaGroup;

export type MediaHelpers<T extends string> = WrappedMediaDescriptor<T>;

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

export const mediaQuery = (
  options: MediaQueryOptions,
  config?: MediaConfig,
): string => mediaQueryString(options, resolveMediaConfig(config));

export const breakpoint = ({
  min,
  max,
  config,
}: {
  min?: number;
  max?: number;
  config?: MediaConfig;
}): MediaGroup =>
  wrapMediaGroup({
    min: mediaQuery({ min }, config),
    max: mediaQuery({ max }, config),
    exact: mediaQuery({ min, max }, config),
  });

export { wrapMediaDescriptor };
