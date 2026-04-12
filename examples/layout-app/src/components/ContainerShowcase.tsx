import styled from "styled-components";
import { Container } from "./Container";
import { Card } from "./Card";

const Showcase = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ContainerShowcase = () => (
  <Showcase>
    <Container variant="default">
      <Card>Default container</Card>
    </Container>
    <Container variant="narrow">
      <Card>Narrow container</Card>
    </Container>
    <Container variant="wide">
      <Card>Wide container</Card>
    </Container>
  </Showcase>
);
