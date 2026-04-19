import { theme } from "./theme";

// --- Delivery: inject theme.css once at app root ---
const style = document.createElement("style");
style.textContent = theme.css;
document.head.appendChild(style);

// --- Base page styles ---
document.head.appendChild(Object.assign(document.createElement("style"), {
  textContent: `
    * { margin: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #f8f9fa; color: #1d1d1f; }
    h1 { margin-bottom: 0.5rem; }
    h1 small { font-weight: 400; font-size: 0.8rem; color: #666; }
    h2 { margin: 1.5rem 0 0.75rem; font-size: 1.1rem; }
    p { margin-bottom: 1rem; color: #555; font-size: 0.9rem; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; align-items: start; margin-bottom: 16px; }
    pre { background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px; overflow: auto; font-size: 0.75rem; line-height: 1.5; }
  `,
}));

const app = document.getElementById("app")!;
app.innerHTML = `
  <h1>Delivery: Single Global CSS <small>one &lt;style&gt; tag</small></h1>
  <p>
    All variables and recipe rules in one stylesheet, injected at app root.
    This is the simplest setup — works for most apps.
  </p>

  <h2>How it works</h2>
  <pre><code>import { createTheme } from "@theme-registry/theme-kit";

const theme = createTheme(rawTheme, options);

// Inject once at app root
const style = document.createElement("style");
style.textContent = theme.css;
document.head.appendChild(style);

// Use class names anywhere
element.className = theme.components.getClass("buttons", "primary");</code></pre>

  <h2>Live demo</h2>
  <div class="row">
    <button class="${theme.components.getClass("buttons", "primary")}">Primary</button>
    <button class="${theme.components.getClass("buttons", "danger")}">Danger</button>
  </div>
  <div class="row">
    <div class="${theme.components.getClass("cards", "default")}">
      <strong>Default card</strong>
      <p style="margin-top:8px">Styled by global CSS variables + recipe classes.</p>
    </div>
    <div class="${theme.components.getClass("cards", "elevated")}">
      <strong>Elevated card</strong>
      <p style="margin-top:8px">Same theme, elevated variant.</p>
    </div>
  </div>

  <h2>What's in the &lt;style&gt; tag (${theme.css.length} chars)</h2>
  <pre><code>${escapeHtml(theme.css)}</code></pre>
`;

function escapeHtml(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
