export const formatScalar = (value: number | string): string =>
  typeof value === "number" ? `${value}px` : value;
