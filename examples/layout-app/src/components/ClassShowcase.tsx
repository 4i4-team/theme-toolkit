import styled from "styled-components";
import { useTheme } from "styled-components";

const Section = styled.section`
  margin-top: 32px;
`;

const Title = styled.h3`
  margin-bottom: 12px;
  font-size: 20px;
`;

const ClassList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ClassItem = styled.li`
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
`;

const ClassName = styled.code`
  font-family: "IBM Plex Mono", monospace;
  font-size: 13px;
  color: #2251ff;
`;

const Description = styled.span`
  font-size: 13px;
  color: #4a4a68;
  margin-top: 4px;
`;

const sanitize = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase();

const formatValue = (value?: string) => (value === undefined ? "n/a" : value);

type ClassEntry = {
  className: string;
  description: string;
};

const buildSpacingClasses = (prefix: string, spacing: Record<string, { value: string }>): ClassEntry[] =>
  Object.entries(spacing).flatMap(([name, token]) => {
    const segment = sanitize(name);
    const value = formatValue(token?.value);
    return [
      { className: `${prefix}-gap-${segment}`, description: `Sets gap to ${value}` },
      { className: `${prefix}-px-${segment}`, description: `Horizontal padding = ${value}` },
      { className: `${prefix}-py-${segment}`, description: `Vertical padding = ${value}` },
      { className: `${prefix}-mx-${segment}`, description: `Horizontal margin = ${value}` },
      { className: `${prefix}-my-${segment}`, description: `Vertical margin = ${value}` },
    ];
  });

const buildStackClasses = (
  prefix: string,
  stacks: Record<string, { direction: string; inline: boolean; gap?: { value: string }; align?: string; justify?: string; wrap?: string }>,
): ClassEntry[] =>
  Object.entries(stacks).map(([name, stack]) => ({
    className: `${prefix}-stack-${sanitize(name)}`,
    description: `${stack.inline ? "inline-flex" : "flex"} ${stack.direction} | gap ${formatValue(stack.gap?.value)}${stack.align ? ` | align ${stack.align}` : ""}${stack.justify ? ` | justify ${stack.justify}` : ""}${stack.wrap ? ` | wrap ${stack.wrap}` : ""}`,
  }));

const buildGridClasses = (
  prefix: string,
  grids: Record<string, { templateColumns?: string; templateRows?: string; gap?: { value: string } }>,
): ClassEntry[] =>
  Object.entries(grids).map(([name, grid]) => ({
    className: `${prefix}-grid-${sanitize(name)}`,
    description: `grid-template-columns ${grid.templateColumns ?? "auto"}${grid.templateRows ? ` | rows ${grid.templateRows}` : ""}${grid.gap ? ` | gap ${grid.gap.value}` : ""}`,
  }));

const buildContainerClasses = (
  prefix: string,
  containers: Record<string, { mode: string; inset: { value: string }; maxWidth?: string }>,
): ClassEntry[] =>
  Object.entries(containers).map(([name, container]) => ({
    className: `${prefix}-container-${sanitize(name)}`,
    description: `${container.mode} container | inset ${container.inset.value}${container.maxWidth ? ` | max-width ${container.maxWidth}` : ""}`,
  }));

const buildStyleClasses = (
  prefix: string,
  styles: Record<string, Record<string, { values: { marginY?: { value: string }; paddingY?: { value: string }; gap?: { value: string } } }>>,
): ClassEntry[] =>
  Object.entries(styles).flatMap(([group, variants]) =>
    Object.entries(variants).map(([variant, definition]) => ({
      className: `${prefix}-${sanitize(group)}-${sanitize(variant)}`,
      description: `marginY ${formatValue(definition.values.marginY?.value)} | paddingY ${formatValue(definition.values.paddingY?.value)} | gap ${formatValue(definition.values.gap?.value)}`,
    })),
  );

const buildColumnClasses = (prefix: string, size: number, breakpoints: string[]): ClassEntry[] => {
  const entries: ClassEntry[] = [];
  breakpoints.forEach(bp => {
    const segment = sanitize(bp);
    for (let span = 1; span <= size; span += 1) {
      entries.push({ className: `${prefix}-col-${segment}-${span}`, description: `Grid column span ${span}/${size}` });
    }
    for (let offset = 1; offset < size; offset += 1) {
      entries.push({ className: `${prefix}-offset-${segment}-${offset}`, description: `Grid column offset ${offset}` });
    }
  });
  return entries;
};

const SectionBlock = ({ title, entries }: { title: string; entries: ClassEntry[] }) => (
  <Section>
    <Title>{title}</Title>
    <ClassList>
      {entries.map(entry => (
        <ClassItem key={entry.className}>
          <ClassName>.{entry.className}</ClassName>
          <Description>{entry.description}</Description>
        </ClassItem>
      ))}
    </ClassList>
  </Section>
);

export const ClassShowcase = () => {
  const theme = useTheme();
  const layoutTokens = theme.layoutTokens;
  const prefix = theme.layoutClassPrefix || "dt";
  const breakpoints = Object.keys(theme.breakpoints ?? {});

  if (!layoutTokens) {
    return null;
  }

  const sections: Array<{ title: string; entries: ClassEntry[] }> = [
    { title: "Containers", entries: buildContainerClasses(prefix, layoutTokens.containers ?? {}) },
    { title: "Column Spans & Offsets", entries: buildColumnClasses(prefix, layoutTokens.columns.size, breakpoints) },
    { title: "Semantic Styles", entries: buildStyleClasses(prefix, layoutTokens.styles ?? {}) },
    { title: "Stacks", entries: buildStackClasses(prefix, layoutTokens.stacks ?? {}) },
    { title: "Grids", entries: buildGridClasses(prefix, layoutTokens.grids ?? {}) },
    { title: "Spacing Utilities", entries: buildSpacingClasses(prefix, layoutTokens.spacing ?? {}) },
  ];

  return (
    <div>
      {sections.map(section => (
        <SectionBlock key={section.title} title={section.title} entries={section.entries} />
      ))}
    </div>
  );
};
