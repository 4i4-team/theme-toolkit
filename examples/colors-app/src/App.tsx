import { useState } from "react";
import { createGlobalStyle } from "styled-components";
import styled from "styled-components";
import { buildPaletteTokens } from "@4i4/theme-toolkit/colors";

const paletteSource = {
  primary: {
    base: "#2251ff",
    text: "#fff",
  },
  accent: {
    base: "#ff8a00",
    text: "#1d1d1f",
  },
} as const;

const { tokens, toCSS } = buildPaletteTokens(paletteSource, { prefix: "--brand" });

const GlobalStyles = createGlobalStyle`
  :root {
    ${toCSS()}
  }

  body {
    margin: 0;
    font-family: "Inter", sans-serif;
    background: #f5f6fb;
  }
`;

const Grid = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  gap: 24px;
  padding: 40px;
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
    <>
      <GlobalStyles />
      <Grid>
        <Swatch name="primary">Primary</Swatch>
        <Swatch name="accent">Accent</Swatch>
      </Grid>
      <Drawer open={open}>
        <strong>Palette Tokens</strong>
        <pre>{JSON.stringify(tokens, null, 2)}</pre>
        <strong>CSS Variables</strong>
        <pre>{toCSS()}</pre>
      </Drawer>
      <Toggle onClick={() => setOpen(current => !current)}>
        {open ? "Hide" : "Show"} tokens
      </Toggle>
    </>
  );
}
