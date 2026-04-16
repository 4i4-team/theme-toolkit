import { useState } from "react";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import styled from "styled-components";
import { theme } from "./theme";

const GlobalStyles = createGlobalStyle`
  :root {
    ${({ theme }) => theme.colors.css}
    ${({ theme }) => theme.typography.css}
  }
  ${({ theme }) => theme.layoutCSS}
`;

const Hero = styled.section`
  min-height: 100vh;
  ${({ theme }) => theme.layoutStyleMixin("section", "hero")}
`;

const Container = styled.div`
  ${({ theme }) => theme.layoutContainerMixin("default")}
`;

const Grid = styled.div`
  ${({ theme }) => theme.layoutColumnsMixin()}
`;

const Card = styled.article`
  padding: 32px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  ${({ theme }) => theme.typography.mixin("heading", "xl")}
`;

const Copy = styled.p`
  ${({ theme }) => theme.typography.mixin("body", "md")}
`;

const Drawer = styled.aside<{ open: boolean }>`
  position: fixed;
  left: 16px;
  bottom: ${({ open }) => (open ? "80px" : "-400px")};
  width: 360px;
  max-height: 60vh;
  padding: 16px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15);
  transition: bottom 0.3s ease;
  overflow: auto;
`;

const Toggle = styled.button`
  position: fixed;
  left: 16px;
  bottom: 16px;
  border: none;
  border-radius: 999px;
  padding: 12px 20px;
  background: #1d1d1f;
  color: #fff;
  cursor: pointer;
`;

export function App() {
  const [open, setOpen] = useState(false);
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Hero>
        <Container>
          <Title>@4i4/theme-toolkit</Title>
          <Grid>
            <Card>
              <h2>Palette Tokens</h2>
              <Copy>Primary main: {theme.colors.tokens.primary.variants.main}</Copy>
            </Card>
            <Card>
              <h2>Typography</h2>
              <Copy>Mixins render semantic text styles without boilerplate.</Copy>
            </Card>
            <Card>
              <h2>Layout</h2>
              <Copy>Layout mixins + CSS vars are emitted from the same source.</Copy>
            </Card>
          </Grid>
        </Container>
      </Hero>
      <Drawer open={open}>
        <strong>Palette Tokens</strong>
        <pre>{JSON.stringify(theme.colors.tokens, null, 2)}</pre>
        <strong>Typography Tokens</strong>
        <pre>{JSON.stringify(theme.typography.tokens, null, 2)}</pre>
        <strong>Layout Tokens</strong>
        <pre>{JSON.stringify(theme.layoutTokens, null, 2)}</pre>
      </Drawer>
      <Toggle onClick={() => setOpen(current => !current)}>
        {open ? "Hide" : "Show"} tokens
      </Toggle>
    </ThemeProvider>
  );
}
