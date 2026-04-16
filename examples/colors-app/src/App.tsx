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
  ${({ theme }) => theme.colors.recipes.css}
`;

const Grid = styled.div`
  min-height: 100vh;
  display: grid;
  gap: 32px;
  padding: 64px;
  background: #f5f6fb;
`;

const PaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
`;

const PaletteCard = styled.article`
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const PaletteHeader = styled.header`
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: capitalize;
`;

const SwatchList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
`;

const SwatchItem = styled.div<{ $colorVar: string; $textVar: string }>`
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  color: ${({ $textVar }) => `var(${$textVar})`};
  background: ${({ $colorVar }) => `var(${$colorVar})`};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RecipeSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RecipeTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const RecipeCard = styled.article`
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 10px 25px rgba(10, 15, 44, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
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
  const paletteNames = Object.keys(theme.colors.tokens);
  const surfaceRecipes = Object.keys(theme.colors.recipes.classes.surfaces ?? {});
  const buttonRecipes = Object.keys(theme.colors.recipes.classes.buttons ?? {});
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Grid>
        <PaletteGrid>
          {paletteNames.map(name => {
            const token = theme.colors.tokens[name];
            const swatchEntries = Object.entries(token.variants);
            return (
              <PaletteCard key={name}>
                <PaletteHeader>
                  <strong>{name}</strong>
                  <span>{token.text}</span>
                </PaletteHeader>
                <SwatchList>
                  {swatchEntries.map(([variant, value]) => (
                    <SwatchItem
                      key={variant}
                      $colorVar={`--brand-color--${sanitize(name)}--${sanitize(variant)}`}
                      $textVar={`--brand-text--${sanitize(name)}`}
                    >
                      <small>{variant}</small>
                      <strong>{value}</strong>
                    </SwatchItem>
                  ))}
                </SwatchList>
              </PaletteCard>
            );
          })}
        </PaletteGrid>
        <RecipeSection>
          <RecipeTitle>
            <div>
              <strong>Color Recipes</strong>
              <p>Pre-baked background, text, and border combos.</p>
            </div>
          </RecipeTitle>
          <RecipeGrid>
            {surfaceRecipes.map(variant => {
              const className = theme.colors.recipes.getClass("surfaces", variant);
              if (!className) {
                return null;
              }
              return (
                <RecipeCard key={variant} className={className}>
                  <small>surfaces.{variant}</small>
                  <strong>Surface {variant}</strong>
                  <span>Background + text + border driven by palette tokens.</span>
                </RecipeCard>
              );
            })}
          </RecipeGrid>
          <RecipeGrid>
            {buttonRecipes.map(variant => {
              const className = theme.colors.recipes.getClass("buttons", variant);
              if (!className) {
                return null;
              }
              return (
                <RecipeCard key={variant} className={className}>
                  <small>buttons.{variant}</small>
                  <strong>{variant} CTA</strong>
                  <span>Ready-to-use focus + outline styles.</span>
                </RecipeCard>
              );
            })}
          </RecipeGrid>
        </RecipeSection>
      </Grid>
      <Drawer open={open}>
        <strong>Palette Tokens</strong>
        <pre>{JSON.stringify(theme.colors.tokens, null, 2)}</pre>
      </Drawer>
      <Toggle onClick={() => setOpen(current => !current)}>
        {open ? "Hide" : "Show"} tokens
      </Toggle>
    </ThemeProvider>
  );
}

const sanitize = (value: string) => value.replace(/\s+/g, "-").toLowerCase();
