import { useState } from "react";
import { theme } from "./theme";
import { PageWrapper, Header, HeaderTitle, HeaderSubtitle, Main, Section, SectionTitle, SectionDescription } from "./components/PageLayout";
import { Nav, NavTab } from "./components/Nav";
import { ButtonRow, Button, GhostButton } from "./components/Button";
import { CardGrid, Card, HeroCard, CardTitle, CardBody } from "./components/Card";
import { Badge, BadgeRow } from "./components/Badge";
import { Heading1, Heading2, Heading3, BodyLarge, Body, BodySmall, InlineCode, TypographyShowcase } from "./components/Typography";
import { SwatchGrid, Swatch, SwatchLabel } from "./components/ColorSwatch";
import { ResponsiveBox, ResponsiveLabel } from "./components/ResponsiveDemo";
import { CodeBlock, Accordion, AccordionButton } from "./components/CodeBlock";
import { TokenDemoGrid, TokenCard, TokenNeutralCard, TokenSpacingDemo, TokenSpacingBox, ResponsiveTokenCard } from "./components/TokenDemo";

type TabKey = "buttons" | "cards" | "typography" | "colors" | "direct" | "responsive" | "tokens";

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("buttons");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "buttons", label: "Buttons" },
    { key: "cards", label: "Cards" },
    { key: "typography", label: "Typography" },
    { key: "colors", label: "Colors" },
    { key: "direct", label: "Direct Tokens" },
    { key: "responsive", label: "Responsive" },
    { key: "tokens", label: "Tokens" },
  ];

  return (
    <PageWrapper>
      <Header>
        <HeaderTitle>@theme-registry/theme-kit</HeaderTitle>
        <HeaderSubtitle>React + styled-components example</HeaderSubtitle>
      </Header>

      <Nav>
        {tabs.map(({ key, label }) => (
          <NavTab key={key} $active={activeTab === key} onClick={() => setActiveTab(key)}>
            {label}
          </NavTab>
        ))}
      </Nav>

      <Main>
        {activeTab === "buttons" && <ButtonsSection />}
        {activeTab === "cards" && <CardsSection />}
        {activeTab === "typography" && <TypographySection />}
        {activeTab === "colors" && <ColorsSection />}
        {activeTab === "direct" && <DirectTokensSection />}
        {activeTab === "responsive" && <ResponsiveSection />}
        {activeTab === "tokens" && <TokensSection />}
      </Main>
    </PageWrapper>
  );
}

function ButtonsSection() {
  return (
    <Section>
      <SectionTitle>Buttons</SectionTitle>
      <SectionDescription>
        Styled components using CSS variables from the theme. Each button reads its styling from the generated custom properties.
      </SectionDescription>

      <ButtonRow>
        <Button className={theme.components.getClass("buttons", "primary")}>Primary</Button>
        <Button className={theme.components.getClass("buttons", "primary-sm")} $variant="primary-sm">Primary Small</Button>
        <Button className={theme.components.getClass("buttons", "danger")} $variant="danger">Danger</Button>
        <GhostButton>Ghost</GhostButton>
      </ButtonRow>

      <SectionTitle as="h3" style={{ fontSize: "0.95rem" }}>Component classes (via components subsystem)</SectionTitle>
      <CodeBlock>
        {Object.entries((theme.components.classes as any)?.buttons ?? {})
          .map(([name, data]: [string, any]) => `${name}: "${data.className}"`)
          .join("\n")}
      </CodeBlock>
    </Section>
  );
}

function CardsSection() {
  return (
    <Section>
      <SectionTitle>Cards</SectionTitle>
      <SectionDescription>
        Cards use CSS custom properties for radius, shadow, and spacing. The styled components reference vars directly.
      </SectionDescription>

      <CardGrid>
        <Card>
          <CardTitle>Default Card</CardTitle>
          <CardBody>Base radius and shadow from effects tokens.</CardBody>
          <BadgeRow style={{ marginTop: 12 }}>
            <Badge $variant="default">default</Badge>
          </BadgeRow>
        </Card>

        <Card $elevated>
          <CardTitle>Elevated Card</CardTitle>
          <CardBody>Larger radius and deeper shadow for emphasis.</CardBody>
          <BadgeRow style={{ marginTop: 12 }}>
            <Badge $variant="success">live</Badge>
          </BadgeRow>
        </Card>

        <HeroCard>
          <CardTitle as="h3" style={{ color: "inherit" }}>Hero Card</CardTitle>
          <CardBody style={{ color: "inherit", opacity: 0.9, marginTop: 8 }}>
            Primary color background from color tokens.
          </CardBody>
        </HeroCard>
      </CardGrid>

      <SectionTitle as="h3" style={{ fontSize: "0.95rem" }}>CSS variables used</SectionTitle>
      <CodeBlock>{`/* Card.ts */
border-radius: var(--app-effects-radius);      /* base */
box-shadow: var(--app-effects-shadow);          /* base */
padding: var(--app-layout-spacing--xl);         /* spacing token */

/* Elevated variant */
border-radius: var(--app-effects-radius--lg);
box-shadow: var(--app-effects-shadow--lg);`}</CodeBlock>
    </Section>
  );
}

function TypographySection() {
  return (
    <Section>
      <SectionTitle>Typography</SectionTitle>
      <SectionDescription>
        Styled components reference typography CSS variables for font family, size, weight, line height, and letter spacing.
      </SectionDescription>

      <TypographyShowcase>
        <Heading1>Heading H1</Heading1>
        <Heading2>Heading H2</Heading2>
        <Heading3>Heading H3</Heading3>
        <BodyLarge style={{ marginTop: 16 }}>Body large — for intros and lead paragraphs.</BodyLarge>
        <Body>Body base — default reading text with comfortable line height.</Body>
        <BodySmall>Body small — captions and metadata.</BodySmall>
        <Body style={{ marginTop: 12 }}>
          Inline code: <InlineCode>createTheme(rawTheme, options)</InlineCode>
        </Body>
      </TypographyShowcase>

      <SectionTitle as="h3" style={{ fontSize: "0.95rem" }}>typographyMixin (headings)</SectionTitle>
      <CodeBlock>{`import { typographyMixin } from "@4i4/theme-toolkit";

const Heading1 = styled.h1\`
  \${({ theme }) =>
    typographyMixin(
      theme.typography.tokens,
      "app",           // prefix
      "heading",       // recipe group
      "h1",            // recipe variant
      theme.typography.recipes,
    )}
\`;`}</CodeBlock>

      <SectionTitle as="h3" style={{ fontSize: "0.95rem" }}>CSS variables (body)</SectionTitle>
      <CodeBlock>{`const BodyLarge = styled.p\`
  font-size: var(--app-typography-font-size--lg);
  line-height: var(--app-typography-line-height--loose);
\`;`}</CodeBlock>
    </Section>
  );
}

function ColorsSection() {
  const tokens = theme.colors.tokens as Record<string, { base: string; variants?: Record<string, string> }>;

  return (
    <Section>
      <SectionTitle>Colors</SectionTitle>
      <SectionDescription>
        Color palette tokens rendered as swatches. Each color generates CSS custom properties.
      </SectionDescription>

      {Object.entries(tokens).map(([name, token]) => (
        <div key={name} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: "0.95rem", marginBottom: 8, textTransform: "capitalize" }}>{name}</h3>
          <SwatchGrid>
            <Swatch $bg={token.base} $color="#fff">
              base
              <SwatchLabel>{token.base}</SwatchLabel>
            </Swatch>
            {Object.entries(token.variants ?? {}).map(([variant, value]) => (
              <Swatch
                key={variant}
                $bg={String(value)}
                $color={variant === "light" ? "#343a40" : "#fff"}
              >
                {variant}
                <SwatchLabel>{String(value)}</SwatchLabel>
              </Swatch>
            ))}
          </SwatchGrid>
        </div>
      ))}
    </Section>
  );
}

function DirectTokensSection() {
  return (
    <Section>
      <SectionTitle>Direct Token Access</SectionTitle>
      <SectionDescription>
        Styled components can read token values directly from the theme object via SC interpolations
        — e.g. <InlineCode>{"${({ theme }) => theme.colors.tokens.primary.base}"}</InlineCode>.
        This is useful when you need the raw value rather than a CSS variable reference.
      </SectionDescription>

      <TokenDemoGrid>
        <TokenCard>
          <strong>Primary token card</strong>
          <p style={{ marginTop: 8, opacity: 0.9, fontSize: "0.85rem" }}>
            Background, color, font, shadow all read from tokens.
          </p>
        </TokenCard>
        <TokenNeutralCard>
          <strong>Neutral token card</strong>
          <p style={{ marginTop: 8 }}>
            Uses neutral.light background and neutral.dark text from color tokens.
          </p>
        </TokenNeutralCard>
      </TokenDemoGrid>

      <SectionTitle as="h3" style={{ fontSize: "0.95rem" }}>Spacing tokens</SectionTitle>
      <SectionDescription>
        Box sizes driven by <InlineCode>theme.layout.tokens.spacing.variants</InlineCode>.
      </SectionDescription>
      <TokenSpacingDemo>
        {["xs", "sm", "md", "lg", "xl", "2xl"].map((size) => (
          <div key={size} style={{ textAlign: "center" }}>
            <TokenSpacingBox $size={size} />
            <div style={{ fontSize: "0.7rem", marginTop: 4, color: "#868e96" }}>{size}</div>
          </div>
        ))}
      </TokenSpacingDemo>

      <SectionTitle as="h3" style={{ fontSize: "0.95rem" }}>Tokens + media templates</SectionTitle>
      <SectionDescription>
        Combining direct token access with <InlineCode>theme.media.md.min</InlineCode> — token values
        used inside media query blocks. Resize the window to see changes.
      </SectionDescription>
      <ResponsiveTokenCard>
        <strong>Responsive token card</strong>
        <p style={{ marginTop: 8, opacity: 0.85 }}>
          Background and font size change at md and lg breakpoints, all from tokens.
        </p>
      </ResponsiveTokenCard>

      <SectionTitle as="h3" style={{ fontSize: "0.95rem" }}>Code</SectionTitle>
      <CodeBlock>{`const TokenCard = styled.div\`
  background: \${({ theme }) => theme.colors.tokens.primary.base};
  color: \${({ theme }) => theme.colors.tokens.primary.variants.text};
  font-size: \${({ theme }) => \`\${theme.typography.tokens.fontSize.variants.lg}px\`};
  box-shadow: \${({ theme }) => theme.effects.tokens.shadow.variants.lg};
\`;

const ResponsiveTokenCard = styled.div\`
  background: \${({ theme }) => theme.colors.tokens.neutral.variants.light};

  \${({ theme }) => theme.media.md.min\`
    background: \${theme.colors.tokens.primary.variants.light};
    font-size: \${theme.typography.tokens.fontSize.variants.lg}px;
  \`}

  \${({ theme }) => theme.media.lg.min\`
    background: \${theme.colors.tokens.success.base};
    color: \${theme.colors.tokens.success.variants.text};
  \`}
\`;`}</CodeBlock>
    </Section>
  );
}

function ResponsiveSection() {
  return (
    <Section>
      <SectionTitle>Responsive (media templates)</SectionTitle>
      <SectionDescription>
        The SC-wrapped media descriptor provides tagged template functions:
        {" "}<InlineCode>theme.media.md.min</InlineCode>,{" "}
        <InlineCode>theme.media.lg.min</InlineCode>, etc.
      </SectionDescription>

      <ResponsiveBox>
        <ResponsiveLabel>Resize the window</ResponsiveLabel>
      </ResponsiveBox>

      <SectionTitle as="h3" style={{ fontSize: "0.95rem" }}>Usage in styled-components</SectionTitle>
      <CodeBlock>{`const ResponsiveBox = styled.div\`
  background: #fff;
  border: 2px solid #e9ecef;

  \${({ theme }) => theme.media.md.min\`
    border-color: var(--app-colors-primary);
    background: var(--app-colors-primary--light);
  \`}

  \${({ theme }) => theme.media.lg.min\`
    border-color: var(--app-colors-success);
    background: #d3f9d8;
  \`}
\`;`}</CodeBlock>
    </Section>
  );
}

function TokensSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const sections = [
    { key: "colors", label: "Color tokens", data: theme.colors.tokens },
    { key: "typography", label: "Typography tokens", data: theme.typography.tokens },
    { key: "effects", label: "Effects tokens", data: theme.effects.tokens },
    { key: "layout", label: "Layout tokens", data: theme.layout.tokens },
    { key: "components", label: "Components classes", data: theme.components.classes },
  ];

  return (
    <Section>
      <SectionTitle>Tokens & Classes</SectionTitle>
      <SectionDescription>
        Raw computed values from each subsystem. Click to expand.
      </SectionDescription>

      {sections.map(({ key, label, data }) => (
        <Accordion key={key}>
          <AccordionButton onClick={() => setExpanded(expanded === key ? null : key)}>
            {expanded === key ? "\u25BE" : "\u25B8"} {label}
          </AccordionButton>
          {expanded === key && (
            <CodeBlock style={{ marginTop: 4, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              {JSON.stringify(data, null, 2)}
            </CodeBlock>
          )}
        </Accordion>
      ))}

      <SectionTitle as="h3" style={{ fontSize: "0.95rem", marginTop: 24 }}>Generated CSS</SectionTitle>
      <CodeBlock style={{ maxHeight: 400 }}>{theme.css}</CodeBlock>
    </Section>
  );
}
