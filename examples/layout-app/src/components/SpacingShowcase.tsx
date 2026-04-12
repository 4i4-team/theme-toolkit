import { useMemo } from "react";
import { useTheme } from "styled-components";
import styled from "styled-components";
import { TokenGrid, TokenChip, Label, Value } from "./TokenGrid";

const Preview = styled.div<{ value: string }>`
  width: 100%;
  height: 36px;
  border-radius: 999px;
  background: linear-gradient(90deg, #2251ff, transparent);
  background-size: ${({ value }) => value} 100%;
  background-repeat: no-repeat;
  margin-top: 8px;
`;

export const SpacingShowcase = () => {
  const theme = useTheme();
  const entries = useMemo(() => Object.entries(theme.layoutTokens?.spacing ?? {}), [theme]);

  return (
    <TokenGrid>
      {entries.map(([name, token]) => (
        <TokenChip key={name}>
          <Label>{name}</Label>
          <Value>{token.value}</Value>
          <Preview value={token.value} />
        </TokenChip>
      ))}
    </TokenGrid>
  );
};
