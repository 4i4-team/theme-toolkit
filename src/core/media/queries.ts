export type MediaUnit = "px" | "em" | "rem";

export type MediaConfig = {
  unit?: MediaUnit;
  baseFontSize?: number;
};

export type MediaQueryOptions = {
  min?: number;
  max?: number;
  orientation?: "landscape" | "portrait";
};

const DEFAULT_MEDIA_CONFIG: Required<MediaConfig> = {
  unit: "px",
  baseFontSize: 16,
};

export const resolveMediaConfig = (
  config?: MediaConfig,
): Required<MediaConfig> => ({
  unit: config?.unit ?? DEFAULT_MEDIA_CONFIG.unit,
  baseFontSize:
    config?.baseFontSize && config.baseFontSize > 0
      ? config.baseFontSize
      : DEFAULT_MEDIA_CONFIG.baseFontSize,
});

const formatWidth = (value: number, config: Required<MediaConfig>): string => {
  if (config.unit === "px") {
    return `${value}px`;
  }

  const converted = value / config.baseFontSize;
  const trimmed = Number(converted.toFixed(4));
  return `${trimmed}${config.unit}`;
};

export const mediaQueryString = (
  { min, max, orientation }: MediaQueryOptions,
  config: Required<MediaConfig>,
): string => {
  const clauses: string[] = [];

  if (min !== undefined && max !== undefined && min > max) {
    throw new Error("Invalid media query: `min` cannot be greater than `max`.");
  }

  if (min !== undefined) {
    clauses.push(`(min-width: ${formatWidth(min, config)})`);
  }

  if (max !== undefined) {
    clauses.push(`(max-width: ${formatWidth(max, config)})`);
  }

  if (orientation) {
    clauses.push(`(orientation: ${orientation})`);
  }

  if (!clauses.length) {
    return "";
  }

  return `@media ${clauses.join(" and ")}`;
};
