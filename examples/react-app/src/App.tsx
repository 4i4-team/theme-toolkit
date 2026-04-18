import { useState } from "react";
import { theme } from "./theme";

const c = theme.components;
const t = theme.typography;
const colors = theme.colors;

export function App() {
  const [activeTab, setActiveTab] = useState<"buttons" | "cards" | "badges" | "typography" | "tokens">("buttons");

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e9ecef", padding: "24px 32px" }}>
        <h1 className={t.getClass("heading", "h2")!} style={{ margin: 0 }}>
          @theme-registry/theme-kit
        </h1>
        <p style={{ margin: "4px 0 0", color: "#868e96", fontSize: "0.9rem" }}>
          React example — bare, no styled-components
        </p>
      </header>

      <nav style={{ background: "#fff", borderBottom: "1px solid #e9ecef", padding: "0 32px", display: "flex", gap: "4px" }}>
        {(["buttons", "cards", "badges", "typography", "tokens"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 16px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "#1c7ed6" : "#495057",
              borderBottom: activeTab === tab ? "2px solid #1c7ed6" : "2px solid transparent",
              fontSize: "0.9rem",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <main style={{ padding: "32px", maxWidth: 960, margin: "0 auto" }}>
        {activeTab === "buttons" && <ButtonsDemo />}
        {activeTab === "cards" && <CardsDemo />}
        {activeTab === "badges" && <BadgesDemo />}
        {activeTab === "typography" && <TypographyDemo />}
        {activeTab === "tokens" && <TokensDemo />}
      </main>
    </div>
  );
}

function ButtonsDemo() {
  return (
    <section>
      <SectionTitle>Buttons</SectionTitle>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Each button composes colors + typography + layout + effects recipes via the components subsystem.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 24 }}>
        <button className={c.getClass("buttons", "primary")}>Primary</button>
        <button className={c.getClass("buttons", "primary-sm")}>Primary Small</button>
        <button className={c.getClass("buttons", "danger")}>Danger</button>
        <button className={c.getClass("buttons", "success")}>Success</button>
        <button className={c.getClass("buttons", "ghost")}>Ghost</button>
      </div>

      <h3 style={{ fontSize: "0.95rem", marginBottom: 8 }}>Resolved class names</h3>
      <pre style={preStyle}>
        {Object.entries((c.classes as any).buttons)
          .map(([name, data]: [string, any]) => `${name}:\n  className: "${data.className}"\n  classes: [${data.classes.map((c: string) => `"${c}"`).join(", ")}]`)
          .join("\n\n")}
      </pre>
    </section>
  );
}

function CardsDemo() {
  return (
    <section>
      <SectionTitle>Cards</SectionTitle>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Cards compose effects (radius, shadow) + layout (padding), with optional colors and typography.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className={c.getClass("cards", "default")}>
          <h3 className={t.getClass("heading", "h3")}>Default Card</h3>
          <p className={t.getClass("body", "base")} style={{ marginTop: 8, color: "#555" }}>
            Base radius and shadow, comfortable padding.
          </p>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <span className={c.getClass("badges", "default")}>default</span>
          </div>
        </div>

        <div className={c.getClass("cards", "elevated")}>
          <h3 className={t.getClass("heading", "h3")}>Elevated Card</h3>
          <p className={t.getClass("body", "base")} style={{ marginTop: 8, color: "#555" }}>
            Larger radius and shadow for emphasis.
          </p>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <span className={c.getClass("badges", "success")}>live</span>
          </div>
        </div>

        <div className={c.getClass("cards", "hero")}>
          <h3 style={{ margin: 0 }}>Hero Card</h3>
          <p style={{ marginTop: 8, opacity: 0.9 }}>
            Full composition: colors + effects + layout + typography.
          </p>
        </div>
      </div>

      <h3 style={{ fontSize: "0.95rem", marginBottom: 8 }}>Resolved class names</h3>
      <pre style={preStyle}>
        {Object.entries((c.classes as any).cards)
          .map(([name, data]: [string, any]) => `${name}:\n  className: "${data.className}"`)
          .join("\n\n")}
      </pre>
    </section>
  );
}

function BadgesDemo() {
  return (
    <section>
      <SectionTitle>Badges</SectionTitle>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Small inline components composed from colors + typography + CSS overrides.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <span className={c.getClass("badges", "default")}>Default</span>
        <span className={c.getClass("badges", "success")}>Success</span>
        <span className={c.getClass("badges", "danger")}>Danger</span>
      </div>

      <h3 style={{ fontSize: "0.95rem", marginBottom: 8 }}>Usage</h3>
      <pre style={preStyle}>{`<span className={theme.components.getClass("badges", "success")}>
  Success
</span>`}</pre>
    </section>
  );
}

function TypographyDemo() {
  return (
    <section>
      <SectionTitle>Typography recipes</SectionTitle>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Typography recipes applied via CSS classes — no styled-components needed.
      </p>

      <div style={{ background: "#fff", borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <h1 className={t.getClass("heading", "h1")}>Heading H1</h1>
        <h2 className={t.getClass("heading", "h2")} style={{ marginTop: 12 }}>Heading H2</h2>
        <h3 className={t.getClass("heading", "h3")} style={{ marginTop: 12 }}>Heading H3</h3>
        <p className={t.getClass("body", "large")} style={{ marginTop: 16 }}>Body large — for intros and lead paragraphs.</p>
        <p className={t.getClass("body", "base")} style={{ marginTop: 8 }}>Body base — default reading text.</p>
        <p className={t.getClass("body", "small")} style={{ marginTop: 8, color: "#868e96" }}>Body small — captions and metadata.</p>
        <p style={{ marginTop: 12 }}>
          Inline code: <code className={t.getClass("code", "inline")} style={{ background: "#f1f3f5", padding: "2px 6px", borderRadius: 4 }}>createTheme()</code>
        </p>
      </div>

      <h3 style={{ fontSize: "0.95rem", marginBottom: 8 }}>Usage</h3>
      <pre style={preStyle}>{`<h1 className={theme.typography.getClass("heading", "h1")}>
  Heading H1
</h1>

<p className={theme.typography.getClass("body", "base")}>
  Body text
</p>`}</pre>
    </section>
  );
}

function TokensDemo() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const sections = [
    { key: "colors", label: "Color tokens", data: colors.tokens },
    { key: "typography", label: "Typography tokens", data: theme.typography.tokens },
    { key: "effects", label: "Effects tokens", data: theme.effects.tokens },
    { key: "layout", label: "Layout tokens", data: theme.layout.tokens },
    { key: "components", label: "Components classes", data: c.classes },
  ];

  return (
    <section>
      <SectionTitle>Tokens & Classes</SectionTitle>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Raw computed values from each subsystem.
      </p>

      {sections.map(({ key, label, data }) => (
        <div key={key} style={{ marginBottom: 8 }}>
          <button
            onClick={() => setExpanded(expanded === key ? null : key)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "12px 16px",
              background: "#fff",
              border: "1px solid #dee2e6",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#343a40",
            }}
          >
            {expanded === key ? "▾" : "▸"} {label}
          </button>
          {expanded === key && (
            <pre style={{ ...preStyle, marginTop: 4, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      ))}

      <h3 style={{ fontSize: "0.95rem", margin: "24px 0 8px" }}>Generated CSS</h3>
      <pre style={{ ...preStyle, maxHeight: 400, overflow: "auto" }}>{theme.css}</pre>
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className={t.getClass("heading", "h2")} style={{ marginBottom: 12 }}>
      {children}
    </h2>
  );
}

const preStyle: React.CSSProperties = {
  background: "#1e1e2e",
  color: "#cdd6f4",
  padding: 16,
  borderRadius: 8,
  overflow: "auto",
  fontSize: "0.8rem",
  lineHeight: 1.5,
};
