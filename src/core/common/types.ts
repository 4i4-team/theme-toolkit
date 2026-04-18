export type PrimitiveValue = string | number;

export type Breakpoints<TKey extends string = string> = Record<TKey, number>;

export type NormalizedBreakpoints<TKey extends string = string> = Record<TKey, { base: number }>;

export type ResponsiveQuery = "min" | "max" | "exact";

export type ResponsiveOrientation = "landscape" | "portrait";

export type ResponsiveOverride<
  TValue,
  TExtra extends Record<string, unknown> = {},
  TBreakpoint extends string = string,
> = {
  breakpoint: TBreakpoint;
  query?: ResponsiveQuery;
  variant?: string;
  target?: string;
  orientation?: ResponsiveOrientation;
} & Partial<{ base: TValue } & TExtra>;

export type NormalizedResponsiveOverride<
  TValue,
  TExtra extends Record<string, unknown> = {},
  TBreakpoint extends string = string,
> = Omit<ResponsiveOverride<TValue, TExtra, TBreakpoint>, "query"> & {
  query: ResponsiveQuery;
};

export type VariantValue<
  TValue,
  TExtra extends Record<string, unknown> = {},
  TBreakpoint extends string = string,
> = TValue | ({ base: TValue } & TExtra);

export type ExtendedProperty<
  TValue,
  TExtra extends Record<string, unknown> = {},
  TBreakpoint extends string = string,
> = {
  base: TValue;
  responsive?: ResponsiveOverride<TValue, TExtra, TBreakpoint>[];
  variants?: Record<string, VariantValue<TValue, TExtra, TBreakpoint>>;
} & TExtra;

export type PropertyValue<
  TValue,
  TExtra extends Record<string, unknown> = {},
  TBreakpoint extends string = string,
> = TValue | ExtendedProperty<TValue, TExtra, TBreakpoint>;

export type NormalizedVariantValue<
  TValue,
  TExtra extends Record<string, unknown> = {},
  TBreakpoint extends string = string,
> = {
  base: TValue;
} & TExtra;

export type NormalizedPropertyValue<
  TValue,
  TExtra extends Record<string, unknown> = {},
  TBreakpoint extends string = string,
> = {
  base: TValue;
  responsive: NormalizedResponsiveOverride<TValue, TExtra, TBreakpoint>[];
  variants?: Record<string, NormalizedVariantValue<TValue, TExtra, TBreakpoint>>;
} & TExtra;

export type PropertyNormalizationOptions<
  TValue,
  TBreakpoint extends string = string,
> = {
  propertyPath?: string;
  coerceValue?: (value: TValue) => TValue;
  fallbackBase?: TValue;
  allowedBreakpoints?: ReadonlyArray<TBreakpoint> | ReadonlySet<TBreakpoint>;
};

export type RecipeResponsiveOverride<
  TProps extends Record<string, unknown>,
  TBreakpoint extends string = string,
> = {
  breakpoint: TBreakpoint;
  query?: ResponsiveQuery;
  variant?: string;
  target?: string;
  orientation?: ResponsiveOrientation;
} & Partial<TProps>;

export type RecipeVariantDefinition<
  TProps extends Record<string, unknown>,
  TBreakpoint extends string = string,
> = TProps & {
  responsive?: RecipeResponsiveOverride<TProps, TBreakpoint>[];
};

export type RecipeGroupDefinition<
  TProps extends Record<string, unknown>,
  TBreakpoint extends string = string,
> = Record<string, RecipeVariantDefinition<TProps, TBreakpoint>>;

export type NormalizedRecipeVariant<
  TProps extends Record<string, unknown>,
  TBreakpoint extends string = string,
> = {
  base: TProps;
  responsive: RecipeResponsiveOverride<TProps, TBreakpoint>[];
};

export type NormalizedRecipeGroup<
  TProps extends Record<string, unknown>,
  TBreakpoint extends string = string,
> = Record<string, NormalizedRecipeVariant<TProps, TBreakpoint>>;
