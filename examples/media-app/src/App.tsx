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

const Wrapper = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f6fb;
`;

const Box = styled.div`
  padding: 32px;
  border-radius: 24px;
  background: #2251ff;
  color: white;
  font-size: 18px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15);
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
      <Wrapper>
        <Box>Media helpers live on theme.media.*</Box>
      </Wrapper>
      <Drawer open={open}>
        <strong>Breakpoints</strong>
        <pre>{JSON.stringify(theme.breakpoints, null, 2)}</pre>
      </Drawer>
      <Toggle onClick={() => setOpen(current => !current)}>
        {open ? "Hide" : "Show"} tokens
      </Toggle>
    </ThemeProvider>
  );
}
