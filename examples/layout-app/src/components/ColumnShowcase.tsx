import styled from "styled-components";
import { Column } from "./Column";
import { Grid } from "./Grid";
import { Card } from "./Card";

const ShowcaseGrid = styled(Grid)`
  margin-top: 32px;
`;

const buildSequence = () => {
  const values: number[] = [];
  for (let i = 1; i <= 6; i += 1) {
    values.push(i, 12 - i);
  }
  return values.filter((value, index) => values.indexOf(value) === index).concat(12);
};

const spans = (() => {
  const seq = buildSequence();
  const last = seq.pop();
  return [...seq, 6, last!];
})();

export const ColumnShowcase = () => (
  <ShowcaseGrid>
    {spans.map(span => (
      <Column key={span} span={{ xs: 12, md: span }}>
        <Card>{span} / 12</Card>
      </Column>
    ))}
  </ShowcaseGrid>
);
