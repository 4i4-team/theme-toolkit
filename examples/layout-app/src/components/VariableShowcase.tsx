import styled from "styled-components";
import { useTheme } from "styled-components";

const SectionTitle = styled.h3`
  margin-top: 32px;
  font-size: 20px;
`;

const VariableGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const VariableCard = styled.div`
  padding: 12px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
`;

const VariableName = styled.code`
  font-family: "IBM Plex Mono", monospace;
  font-size: 13px;
  color: #1d1d1f;
`;

const VariableValue = styled.span`
  margin-top: 6px;
  font-size: 13px;
  color: #4a4a68;
`;

const parseVariables = (css: string) => {
  const regex = /(--[^:]+):\s*([^;]+);/g;
  const entries: Array<{ name: string; value: string }> = [];
  let match: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((match = regex.exec(css)) !== null) {
    const name = match[1].trim();
    const value = match[2].trim();
    const key = `${name}:${value}`;
    if (!seen.has(key)) {
      seen.add(key);
      entries.push({ name, value });
    }
  }
  return entries;
};

export const VariableShowcase = () => {
  const theme = useTheme();
  const css = theme.layoutCSS ?? "";
  const variables = parseVariables(css);

  if (!variables.length) {
    return null;
  }

  return (
    <section>
      <SectionTitle>CSS variables</SectionTitle>
      <VariableGrid>
        {variables.map(variable => (
          <VariableCard key={`${variable.name}-${variable.value}`}>
            <VariableName>{variable.name}</VariableName>
            <VariableValue>{variable.value}</VariableValue>
          </VariableCard>
        ))}
      </VariableGrid>
    </section>
  );
};
