import { useMemo } from "react";
import { useTheme } from "styled-components";
import styled from "styled-components";
import { TokenGrid, TokenChip, Label, Value } from "./TokenGrid";

const PreviewGrid = styled.div<{ value: string }>`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ value }) => value};
  margin-top: 8px;
`;

const Sample = styled.div`
  height: 36px;
  border-radius: 12px;
  background: #e4e7fb;
`;

export const GutterShowcase = () => {
  const theme = useTheme();
  const entries = useMemo(() => Object.entries(theme.layoutTokens?.gutters ?? {}), [theme]);

  return (
    <TokenGrid>
      {entries.map(([name, token]) => (
        <TokenChip key={name}>
          <Label>{name}</Label>
          <Value>{token.value}</Value>
          <PreviewGrid value={token.value}>
            <Sample />
            <Sample />
            <Sample />
          </PreviewGrid>
        </TokenChip>
      ))}
    </TokenGrid>
  );
};
