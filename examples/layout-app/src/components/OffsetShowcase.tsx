import styled from "styled-components";
import { Column } from "./Column";
import { Grid } from "./Grid";
import { Card } from "./Card";

const ShowcaseGrid = styled(Grid)`
  margin-top: 32px;
`;

const buildOffsets = () => {
  const values: Array<{ span: number; offset: number }> = [];
  for (let offset = 1; offset <= 11; offset += 1) {
    values.push({ span: Math.max(1, 12 - offset), offset });
  }
  return values;
};

const pairs = buildOffsets();

export const OffsetShowcase = () => (
  <ShowcaseGrid>
    {pairs.map(pair => (
      <Column key={`offset-${pair.offset}`} span={{ xs: 12, md: pair.span }} offset={{ xs: 0, md: pair.offset }}>
        <Card>
          span {pair.span} / 12, offset {pair.offset}
        </Card>
      </Column>
    ))}
  </ShowcaseGrid>
);
