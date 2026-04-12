import { useState } from "react";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import styled from "styled-components";
import { theme } from "./theme";
import { ColumnShowcase } from "./components/ColumnShowcase";
import { OffsetShowcase } from "./components/OffsetShowcase";
import { ContainerShowcase } from "./components/ContainerShowcase";
import { SpacingShowcase } from "./components/SpacingShowcase";
import { GutterShowcase } from "./components/GutterShowcase";
import { StyleTokensShowcase } from "./components/StyleTokensShowcase";

const GlobalStyles = createGlobalStyle`
  :root {
    ${({ theme }) => theme.paletteCSS}
    ${({ theme }) => theme.typographyCSS}
  }
  
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
  }

  ${({ theme }) => theme.layoutCSS}
`;

const Hero = styled.section`
  ${({ theme }) => theme.layoutStyleMixin("section", "hero")}
  background: linear-gradient(145deg, #f3f6ff, #edf2ff);
`;

const Block = styled.section`
  ${({ theme }) => theme.layoutStyleMixin("section", "block")}
  background: linear-gradient(145deg, #f3f6ff, #edf2ff);
`;


const SectionTitle = styled.h2`
  ${({ theme }) => theme.typographyMixin("heading", "xl")}
  margin-top: 48px;
`;

const Drawer = styled.aside<{ open: boolean }>`
  position: fixed;
  left: 16px;
  bottom: ${({ open }) => (open ? "80px" : "-400px")};
  width: 320px;
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
      <Block>
        <SectionTitle>Container variants</SectionTitle>
      </Block>
      <Hero>
        <ContainerShowcase />
      </Hero>
      <Block>
        <SectionTitle>Spacing tokens</SectionTitle>
        <SpacingShowcase />
        <SectionTitle>Gutter tokens</SectionTitle>
        <GutterShowcase />
        <SectionTitle>Predefined styles</SectionTitle>
        <StyleTokensShowcase />
        <SectionTitle>Column spans</SectionTitle>
        <ColumnShowcase />
        <SectionTitle>Column offsets</SectionTitle>
        <OffsetShowcase />
      </Block>
      <Drawer open={open}>
        <strong>Layout Tokens</strong>
        <pre>{JSON.stringify(theme.layoutTokens, null, 2)}</pre>
      </Drawer>
      <Toggle onClick={() => setOpen(current => !current)}>
        {open ? "Hide" : "Show"} tokens
      </Toggle>
    </ThemeProvider>
  );
}
