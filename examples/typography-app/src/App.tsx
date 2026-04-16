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

const Shell = styled.section`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 48px;
`;

const HeroHeading = styled.h1`
  ${({ theme }) => theme.typography.mixin("heading", "xl")}
`;

const BodyCopy = styled.p`
  ${({ theme }) => theme.typography.mixin("body", "md")}
  max-width: 640px;
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
      <Shell>
        <div>
          <HeroHeading>Typography tokens via theme.typography.mixin</HeroHeading>
          <BodyCopy>
            All semantic styles come from the typography data source used in
            createTheme.
          </BodyCopy>
        </div>
      </Shell>
      <Drawer open={open}>
        <strong>Typography Tokens</strong>
        <pre>{JSON.stringify(theme.typography.tokens, null, 2)}</pre>
      </Drawer>
      <Toggle onClick={() => setOpen(current => !current)}>
        {open ? "Hide" : "Show"} tokens
      </Toggle>
    </ThemeProvider>
  );
}
