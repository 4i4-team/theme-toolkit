import { createGlobalStyle } from "styled-components";
import styled from "styled-components";
import { useState } from "react";
import { buildGridTokens, DEFAULT_BREAKPOINTS } from "@4i4/theme-toolkit";

const layoutSource = {
  spacing: {
    none: 0,
    default: 16,
    relaxed: 32,
  },
  columns: 12,
  containers: {
    default: "layout",
    fluid: {
      mode: "fluid",
      inset: "relaxed",
      maxWidth: { mode: "breakpoint", value: "xl" },
    },
  },
  styles: {
    section: {
      hero: {
        marginY: "relaxed",
        paddingX: "relaxed",
      },
    },
  },
} as const;

const { tokens, helpers, toCSS } = buildGridTokens(
  { layout: layoutSource },
  DEFAULT_BREAKPOINTS,
  { prefix: "--brand" },
);

const GlobalStyles = createGlobalStyle`
  :root {
    --brand-spacing--default: ${tokens.spacing.default.value};
  }

  ${toCSS()}
`;

const Hero = styled.section`
  ${({ theme }) => theme?.layoutStyleMixin?.("section", "hero") || helpers.styleMixin("section", "hero")}
  min-height: 100vh;
  background: linear-gradient(145deg, #f3f6ff, #edf2ff);
`;

const Container = styled.div`
  ${({ theme }) => theme?.layoutContainerMixin?.("fluid")}
`;

const Grid = styled.div`
  ${({ theme }) => theme?.layoutColumnsMixin?.() || helpers.columnsMixin()}
`;

const Card = styled.article`
  padding: 32px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
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
      <Hero>
        <Container>
          <h1>Layout mixins without a ThemeProvider</h1>
          <Grid>
            <Card>Default spacing: {tokens.spacing.default.value}</Card>
            <Card>Columns: {tokens.columns.size}</Card>
            <Card>Fluid container max width: {tokens.containers.fluid.maxWidth ?? "100%"}</Card>
          </Grid>
        </Container>
      </Hero>
      <Drawer open={open}>
        <strong>Layout Tokens</strong>
        <pre>{JSON.stringify(tokens, null, 2)}</pre>
      </Drawer>
      <Toggle onClick={() => setOpen(current => !current)}>
        {open ? "Hide" : "Show"} tokens
      </Toggle>
    </>
  );
}
