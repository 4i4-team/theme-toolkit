import type {
  PropertyValue,
  RecipeGroupDefinition,
  ResponsiveQuery,
} from "../../core/common";

// --- Properties ---

export type SpacingValue = PropertyValue<number>;
export type GutterValue = PropertyValue<number>;
export type AspectRatioValue = PropertyValue<string>;

// --- Container ---

export type ContainerMode = "fixed" | "fluid";

export type ContainerExtras = {
  inset?: string;
  gutter?: string;
  direction?: "row" | "column";
  align?: string;
  justify?: string;
  maxWidth?: string | number;
};

export type ContainerValue = PropertyValue<string, ContainerExtras>;

// --- Columns ---

export type ColumnsConfig = {
  size: number;
  gutter?: string;
  inset?: string;
};

export type ColumnsValue = number | ColumnsConfig;

// --- Grids ---

export type GridDefinition = {
  templateColumns?: string;
  templateRows?: string;
  autoRows?: string;
  autoColumns?: string;
  justifyItems?: string;
  alignItems?: string;
  justifyContent?: string;
  alignContent?: string;
  gap?: string;
  responsive?: Array<{
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
    gap?: string;
  }>;
};

export type GridsDefinition = Record<string, GridDefinition>;

// --- Stacks ---

export type StackDefinition = {
  direction?: "row" | "column";
  align?: string;
  justify?: string;
  wrap?: string;
  inline?: boolean;
  gap?: string;
  responsive?: Array<{
    breakpoint: string;
    query?: ResponsiveQuery;
    direction?: "row" | "column";
    align?: string;
    justify?: string;
    wrap?: string;
    inline?: boolean;
  }>;
};

export type StacksDefinition = Record<string, StackDefinition>;

// --- Recipes ---

export type LayoutRecipeProps = {
  paddingY?: string;
  paddingX?: string;
  marginY?: string;
  marginX?: string;
  gap?: string;
  background?: string;
  [property: string]: string | undefined;
};

export type LayoutRecipeSource<TBreakpoint extends string = string> = Record<
  string,
  RecipeGroupDefinition<LayoutRecipeProps, TBreakpoint>
>;

// --- Source (raw input) ---

export type LayoutSource = {
  spacing?: SpacingValue;
  gutters?: GutterValue;
  aspectRatio?: AspectRatioValue;
  container?: ContainerValue;
  columns?: ColumnsValue;
  grids?: GridsDefinition;
  stacks?: StacksDefinition;
  recipes?: LayoutRecipeSource;
};

// --- Tokens ---

export type LayoutPropertyTokens = {
  base: string | number;
  variants: Record<string, string | number>;
};

export type LayoutTokens = Record<string, LayoutPropertyTokens>;

// --- Options ---

export type LayoutBuilderOptions = {
  prefix?: string;
  classPrefix?: string;
};
