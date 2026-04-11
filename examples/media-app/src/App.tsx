import { useState } from "react";
import styled from "styled-components";
import { mediaQuery, DEFAULT_BREAKPOINTS } from "@4i4/theme-toolkit/media";

const breakpointRule = mediaQuery({ min: DEFAULT_BREAKPOINTS.md });

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
  background: #ffb347;
  color: #1d1d1f;
  font-size: 18px;
  transition: all 0.3s ease;

  ${breakpointRule} {
    background: #2251ff;
    color: white;
    transform: scale(1.05);
  }
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
  const entries = Object.entries(DEFAULT_BREAKPOINTS);

  return (
    <Wrapper>
      <Box>
        Resize past {DEFAULT_BREAKPOINTS.md}px to see the media query kick in.
      </Box>
      <Drawer open={open}>
        <strong>Breakpoints</strong>
        <ul>
          {entries.map(([name, value]) => (
            <li key={name}>
              {name}: {value}px
            </li>
          ))}
        </ul>
        <pre>{breakpointRule}</pre>
      </Drawer>
      <Toggle onClick={() => setOpen(current => !current)}>
        {open ? "Hide" : "Show"} tokens
      </Toggle>
    </Wrapper>
  );
}
