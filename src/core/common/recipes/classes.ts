import { sanitizeIdentifierSegment } from "../css";

export type RecipeClassEntry = {
  variant: string;
  selector: string;
  className: string;
};

export type AssignRecipeClassesOptions = {
  prefix?: string;
  hash?: (input: string) => string;
};

export const assignRecipeClasses = (
  variants: Record<string, string>,
  { prefix, hash }: AssignRecipeClassesOptions = {},
): RecipeClassEntry[] =>
  Object.entries(variants).map(([variant, selector]) => {
    const base = `${prefix ?? "rec"}-${sanitizeIdentifierSegment(variant)}`;
    const className = hash ? `${base}-${hash(selector)}` : base;
    return {
      variant,
      selector,
      className,
    };
  });
