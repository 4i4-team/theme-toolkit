import { useTheme } from "styled-components";
import styled from "styled-components";
import { TokenGrid, TokenChip, Label, Value } from "./TokenGrid";

const GridPreview = styled.div<{ name: string }>`
  ${({ theme, name }) => theme.layoutGridMixin(name)}
  border-radius: 12px;
  border: 1px dashed rgba(34, 81, 255, 0.35);
  background: #fff;
  padding: 12px;
  min-height: 160px;
`;

const GridCell = styled.div`
  border-radius: 10px;
  background: linear-gradient(145deg, #2251ff, #7f86ff);
  min-height: 56px;
`;

const GridSummary = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: #4a4a68;
`;

export const GridPresetShowcase = () => {
  const theme = useTheme();
  const grids = theme.layoutTokens?.grids ?? {};
  const entries = Object.keys(grids);

  if (!entries.length) {
    return null;
  }

  return (
    <TokenGrid>
      {entries.map(name => {
        const definition = theme.layoutGrid(name);
        return (
          <TokenChip key={name}>
            <Label>{name}</Label>
            <Value>{definition?.templateColumns ?? "auto"}</Value>
            <GridPreview name={name}>
              {[...Array(6)].map((_, index) => (
                <GridCell key={`${name}-cell-${index}`} />
              ))}
            </GridPreview>
            <GridSummary>
              {definition?.gap ? `Gap ${definition.gap.value}` : "No gap"}
            </GridSummary>
          </TokenChip>
        );
      })}
    </TokenGrid>
  );
};
