import { useState } from "react";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import styled from "styled-components";
import { theme } from "./theme";

const GlobalStyles = createGlobalStyle`
  :root {
    ${({ theme }) => theme.paletteCSS}
    ${({ theme }) => theme.typographyCSS}
  }
  ${({ theme }) => theme.layoutCSS}
`;

const Grid = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  gap: 24px;
  padding: 40px;
  background: #f5f6fb;
`;

const Swatch = styled.div<{ name: string }>`
  width: 260px;
  padding: 32px;
  border-radius: 24px;
  color: var(--brand-text--${({ name }) => name});
  background: var(--brand-color--${({ name }) => name});
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  text-align: center;
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
      <Grid>
        <Swatch name="primary">Primary</Swatch>
        <Swatch name="accent">Accent</Swatch>
      </Grid>
      <Drawer open={open}>
        <strong>Palette Tokens</strong>
        <pre>{JSON.stringify(theme.paletteTokens, null, 2)}</pre>
      </Drawer>
      <Toggle onClick={() => setOpen(current => !current)}>
        {open ? "Hide" : "Show"} tokens
      </Toggle>
    </ThemeProvider>
  );
}
