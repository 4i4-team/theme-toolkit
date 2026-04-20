/**
 * Convert a style object to a CSS inline style string.
 *
 * ```ts
 * toStyleString({ background: "#4dabf7", color: "#fff", "font-size": "20px" })
 * // → "background: #4dabf7; color: #fff; font-size: 20px"
 * ```
 */
export const toStyleString = (styles: Record<string, string | number>): string =>
  Object.entries(styles)
    .map(([property, value]) => `${property}: ${value}`)
    .join("; ");
