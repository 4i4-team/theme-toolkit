import type { RecipeGroupDefinition } from "../../core/common";

export type ComponentsRecipeProps = {
  colors?: string;
  typography?: string;
  layout?: string;
  effects?: string;
  css?: Record<string, string | number>;
  [subsystem: string]: string | Record<string, string | number> | undefined;
};

export type ComponentsRecipeSource<TBreakpoint extends string = string> = Record<
  string,
  RecipeGroupDefinition<ComponentsRecipeProps, TBreakpoint>
>;

export type ComponentsSource = {
  recipes?: ComponentsRecipeSource;
};

export type ComponentsBuilderOptions = {
  prefix?: string;
  classPrefix?: string;
};

export type ResolvedComponentClass = {
  classes: string[];
  className: string;
};
