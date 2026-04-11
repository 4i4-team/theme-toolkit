import { useState } from "react";
import { createGlobalStyle } from "styled-components";
import styled from "styled-components";
import { buildTypographyTokens, typographyMixin } from "@4i4/theme-toolkit/typography";

const typographySource = {
  families: {
    base: "Inter, sans-serif",
    heading: "DM Serif Display, serif",
    mono: "IBM Plex Mono, monospace",
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
  letterSpacings: {
    tighter: "-0.03em",
    normal: "0",
    wide: "0.04em",
  },
  scale: {
    baseFontSize: 18,
    ratio: "major-third",
  },
  styles: {
    heading: {
      hero: {
        family: "heading",
        size: "2xl",
        weight: "bold",
        lineHeight: "tight",
        letterSpacing: "tighter",
      },
    },
    body: {
      base: {
        family: "base",
        size: "md",
        weight: "regular",
        lineHeight: "normal",
        letterSpacing: "normal",
      },
    },
  },
} as const;

const tokens = buildTypographyTokens(typographySource);

const GlobalStyles = createGlobalStyle`
  :root {
    ${Object.entries(tokens.families)
      .map(([key, value]) => `--font-family-${key}: ${value};`)
      .join("\n")}
  }

  body {
    margin: 0;
    font-family: var(--font-family-base, Inter, sans-serif);
    background: #fdfdfd;
    color: #1f1f1f;
  }
`;

const Shell = styled.section`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 48px;
`;

const HeroHeading = styled.h1`
  ${typographyMixin(tokens, "heading", "hero")}
`;

const BodyCopy = styled.p`
  ${typographyMixin(tokens, "body", "base")}
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
    <>
      <GlobalStyles />
      <Shell>
        <div>
          <HeroHeading>Typography tokens, meet CSS vars.</HeroHeading>
          <BodyCopy>
            Build semantic styles once and reuse them as mixins or CSS strings. This
            example renders heading + body pairs using `typographyMixin` outside of a
            theme context.
          </BodyCopy>
        </div>
      </Shell>
      <Drawer open={open}>
        <strong>Typography Tokens</strong>
        <pre>{JSON.stringify(tokens, null, 2)}</pre>
      </Drawer>
      <Toggle onClick={() => setOpen(current => !current)}>
        {open ? "Hide" : "Show"} tokens
      </Toggle>
    </>
  );
}
