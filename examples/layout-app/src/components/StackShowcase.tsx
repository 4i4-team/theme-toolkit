import { useTheme } from "styled-components";
import styled from "styled-components";
import { TokenGrid, TokenChip, Label, Value } from "./TokenGrid";

const StackPreview = styled.div<{ name: string }>`
  width: 100%;
  ${({ theme, name }) => theme.layoutStackMixin(name)}
  border-radius: 12px;
  border: 1px dashed rgba(34, 81, 255, 0.35);
  background: #fff;
  padding: 16px;
  min-height: 110px;
`;

const StackItem = styled.div`
  flex: 1 1 48px;
  min-width: 48px;
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(120deg, #2251ff, #7f86ff);
`;

const StackSummary = styled.div`
  margin-top: 12px;
  font-size: 12px;
  color: #4a4a68;
`;

export const StackShowcase = () => {
  const theme = useTheme();
  const stacks = theme.layoutTokens?.stacks ?? {};
  const entries = Object.keys(stacks);

  if (!entries.length) {
    return null;
  }

  return (
    <TokenGrid>
      {entries.map(name => {
        const definition = theme.layoutStack(name);
        return (
          <TokenChip key={name}>
            <Label>{name}</Label>
            <Value>
              {definition?.direction ?? "row"}
              {definition?.gap ? ` · gap ${definition.gap.value}` : ""}
            </Value>
            <StackPreview name={name}>
              <StackItem />
              <StackItem />
              <StackItem />
            </StackPreview>
            <StackSummary>
              {definition?.inline ? "Inline flex" : "Block flex"}
              {definition?.justify ? ` · Justify ${definition.justify}` : ""}
              {definition?.align ? ` · Align ${definition.align}` : ""}
            </StackSummary>
          </TokenChip>
        );
      })}
    </TokenGrid>
  );
};
