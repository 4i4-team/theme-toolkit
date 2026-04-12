import React from "react";
import styled, { useTheme } from "styled-components";

const Base = styled.div``;

export type ColumnSpan = Partial<Record<string, number>>;

export interface ColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: ColumnSpan;
  offset?: ColumnSpan;
}

const sanitizeSegment = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase();

const buildClass = (map: ColumnSpan | undefined, prefix: string, type: string) =>
  Object.entries(map ?? {})
    .filter(([, value]) => typeof value === "number")
    .map(([breakpoint, value]) =>
      `${prefix}-${type}-${sanitizeSegment(breakpoint)}-${value}`,
    );

export const Column: React.FC<ColumnProps> = ({
  span,
  offset,
  className,
  children,
  ...rest
}) => {
  const theme = useTheme();
  const classPrefix = theme.layoutClassPrefix || "dt";
  const spanClasses = buildClass(span, classPrefix, "col");
  const offsetClasses = buildClass(offset, classPrefix, "offset");
  const combined = [className, ...spanClasses, ...offsetClasses]
    .filter(Boolean)
    .join(" ");

  return (
    <Base className={combined} {...rest}>
      {children}
    </Base>
  );
};
