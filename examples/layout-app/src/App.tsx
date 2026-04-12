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
import { StackShowcase } from "./components/StackShowcase";
import { GridPresetShowcase } from "./components/GridPresetShowcase";
import { ClassShowcase } from "./components/ClassShowcase";
import { VariableShowcase } from "./components/VariableShowcase";
import { TokenShowcase } from "./components/TokenShowcase";
import { Tabs } from "./components/Tabs";

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

const Block = styled.section`
  ${({ theme }) => theme.layoutStyleMixin("section", "block")}
  background: linear-gradient(145deg, #f3f6ff, #edf2ff);
`;


const SectionTitle = styled.h2`
  ${({ theme }) => theme.typographyMixin("heading", "xl")}
  margin-top: 48px;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const OverlayContent = styled.div`
  width: 100vw;
  height: 100vh;
  background: #f5f6fb;
  overflow: auto;
  position: relative;
  border-radius: 0;
`;

const OverlayHeader = styled.header`
  position: sticky;
  top: 0;
  padding: 24px;
  background: #f5f6fb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
`;

const OverlayHeading = styled.h2`
  ${({ theme }) => theme.typographyMixin("heading", "xl")}
  margin: 0;
`;

const OverlayBody = styled.div`
  padding: 0 0 24px 0;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  border: none;
  border-radius: 999px;
  padding: 8px 16px;
  background: #1d1d1f;
  color: #fff;
  cursor: pointer;
`;

const OpenOverlayButton = styled.button`
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  background: #2251ff;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  box-shadow: 0 12px 30px rgba(34, 81, 255, 0.25);
`;

export function App() {
  const [containersOpen, setContainersOpen] = useState(false);
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Block>
        <Tabs
          tabs={[
            {
              id: "containers",
              label: "Containers",
              content: (
                <>
                  <SectionTitle>Container variants</SectionTitle>
                  <p>Open the overlay to inspect responsive insets and widths using the full viewport.</p>
                  <OpenOverlayButton onClick={() => setContainersOpen(true)}>
                    View container showcase
                  </OpenOverlayButton>
                </>
              ),
            },
            { id: "spacing", label: "Spacing", content: (
                <>
                  <SectionTitle>Spacing tokens</SectionTitle>
                  <SpacingShowcase />
                  <SectionTitle>Gutter tokens</SectionTitle>
                  <GutterShowcase />
                </>
              ) },
            { id: "styles", label: "Styles", content: (
                <>
                  <SectionTitle>Predefined styles</SectionTitle>
                  <StyleTokensShowcase />
                </>
              ) },
            { id: "stacks", label: "Stacks", content: (
                <>
                  <SectionTitle>Stack presets</SectionTitle>
                  <StackShowcase />
                </>
              ) },
            { id: "grids", label: "Grids", content: (
                <>
                  <SectionTitle>Grid presets</SectionTitle>
                  <GridPresetShowcase />
                </>
              ) },
            { id: "columns", label: "Columns", content: (
                <>
                  <SectionTitle>Column spans</SectionTitle>
                  <ColumnShowcase />
                  <SectionTitle>Column offsets</SectionTitle>
                  <OffsetShowcase />
                </>
              ) },
            { id: "classes", label: "Classes", content: (
                <>
                  <SectionTitle>Utility classes</SectionTitle>
                  <ClassShowcase />
                </>
              ) },
            { id: "vars", label: "CSS Variables", content: (
                <>
                  <SectionTitle>CSS variables</SectionTitle>
                  <VariableShowcase />
                </>
              ) },
            { id: "tokens", label: "Tokens", content: (
                <>
                  <SectionTitle>Layout tokens</SectionTitle>
                  <TokenShowcase tokens={theme.layoutTokens} />
                </>
              ) },
          ]}
        />
      </Block>
      {containersOpen && (
        <Overlay>
          <OverlayContent>
            <OverlayHeader>
              <OverlayHeading>Container variants</OverlayHeading>
              <CloseButton onClick={() => setContainersOpen(false)}>Close</CloseButton>
            </OverlayHeader>
            <OverlayBody>
              <ContainerShowcase />
            </OverlayBody>
          </OverlayContent>
        </Overlay>
      )}
    </ThemeProvider>
  );
}
