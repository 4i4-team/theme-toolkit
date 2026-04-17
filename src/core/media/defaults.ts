import type { Breakpoints } from "../common/types";

export type DefaultBreakpointKey = "xs" | "sm" | "md" | "lg" | "xl";
export type DefaultBreakpoints = Breakpoints<DefaultBreakpointKey>;

export const DEFAULT_BREAKPOINTS: DefaultBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1280,
};
