import React from "react";
import styled from "styled-components";

const Base = styled.div``;

export type ColumnSpan = Partial<Record<string, number>>;

export interface ColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: ColumnSpan;
  offset?: ColumnSpan;
}

const buildClass = (map: ColumnSpan | undefined, prefix: string) =>
  Object.entries(map ?? {})
    .filter(([, value]) => typeof value === "number")
    .map(([breakpoint, value]) => `${prefix}${breakpoint}-${value}`);

export const Column: React.FC<ColumnProps> = ({
  span,
  offset,
  className,
  children,
  ...rest
}) => {
  const spanClasses = buildClass(span, "layout-column--");
  const offsetClasses = buildClass(offset, "layout-column-offset--");
  const combined = [className, ...spanClasses, ...offsetClasses]
    .filter(Boolean)
    .join(" ");

  return (
    <Base className={combined} {...rest}>
      {children}
    </Base>
  );
};
