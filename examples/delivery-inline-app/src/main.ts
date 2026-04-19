import { theme } from "./theme";

// --- Delivery: inline values — no CSS variables, for email templates or static exports ---

const style = document.createElement("style");
style.textContent = theme.css;
document.head.appendChild(style);

document.head.appendChild(Object.assign(document.createElement("style"), {
  textContent: `
    * { margin: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #f8f9fa; color: #1d1d1f; }
    h1 { margin-bottom: 0.5rem; }
    h1 small { font-weight: 400; font-size: 0.8rem; color: #666; }
    h2 { margin: 1.5rem 0 0.75rem; font-size: 1.1rem; }
    p { margin-bottom: 1rem; color: #555; font-size: 0.9rem; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; align-items: start; margin-bottom: 16px; }
    pre { background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px; overflow: auto; font-size: 0.75rem; line-height: 1.5; margin-bottom: 16px; }
    .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .compare > div { border: 1px solid #dee2e6; border-radius: 8px; padding: 16px; }
    .compare h3 { font-size: 0.9rem; margin-bottom: 8px; }
    @media (max-width: 700px) { .compare { grid-template-columns: 1fr; } }
  `,
}));

// Also render a default (non-inline) version for comparison
import { createTheme } from "@4i4/theme-toolkit";
import { rawTheme, options } from "./rawTheme";
const defaultTheme = createTheme(rawTheme, options);

const app = document.getElementById("app")!;

const btnPrimaryInline = theme.components.renderRecipe("buttons", "primary");
const btnPrimaryDefault = defaultTheme.components.renderRecipe("buttons", "primary");

app.innerHTML = `
  <h1>Delivery: Inline Values <small>no CSS variables</small></h1>
  <p>
    All values resolved and baked directly into declarations. No <code>var(--...)</code>,
    no <code>:root</code> block. Use for email templates, static HTML exports,
    or environments that don't support CSS custom properties.
  </p>

  <h2>How it works</h2>
  <pre><code>import { createTheme, createCssAdapter } from "@theme-registry/theme-kit";

const theme = createTheme(rawTheme, {
  ...options,
  adapter: createCssAdapter({ inline: true }),
});

// theme.css has no :root block — just rules with resolved values
// .app-color-solid-primary { background: #4dabf7; color: #fff; }</code></pre>

  <h2>Live demo</h2>
  <div class="row">
    <button class="${theme.components.getClass("buttons", "primary")}">Primary</button>
    <button class="${theme.components.getClass("buttons", "danger")}">Danger</button>
  </div>
  <div class="row">
    <div class="${theme.components.getClass("cards", "default")}">
      <strong>Default card</strong>
      <p style="margin-top:8px">No CSS variables used — values are inlined.</p>
    </div>
  </div>

  <h2>Side-by-side: inline vs default</h2>
  <div class="compare">
    <div>
      <h3>Inline (no variables)</h3>
      <pre><code>${escapeHtml(btnPrimaryInline)}</code></pre>
    </div>
    <div>
      <h3>Default (var references)</h3>
      <pre><code>${escapeHtml(btnPrimaryDefault)}</code></pre>
    </div>
  </div>

  <h2>Full inline CSS</h2>
  <pre><code>${escapeHtml(theme.css)}</code></pre>
`;

function escapeHtml(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
