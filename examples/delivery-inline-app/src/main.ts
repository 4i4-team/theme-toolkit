import { theme } from "./theme";
import { createTheme, toStyleString } from "@4i4/theme-toolkit";
import { rawTheme, options } from "./rawTheme";

// --- Delivery: inline styles applied directly on elements ---

// Default theme for comparison
const defaultTheme = createTheme(rawTheme, options);

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

// Get inline style objects
const btnPrimaryStyles = defaultTheme.components.renderRecipe("buttons", "primary", { inline: true });
const btnDangerStyles = defaultTheme.components.renderRecipe("buttons", "danger", { inline: true });
const cardStyles = defaultTheme.components.renderRecipe("cards", "default", { inline: true });
const colorStyles = defaultTheme.colors.renderRecipe("solid", "primary", { inline: true });

// toStyleString is exported from the package

const app = document.getElementById("app")!;
app.innerHTML = `
  <h1>Delivery: Inline Styles <small>applied directly on elements</small></h1>
  <p>
    No CSS classes, no <code>&lt;style&gt;</code> tags, no CSS variables.
    <code>renderRecipe(group, variant, { inline: true })</code> returns a style object
    applied directly via the <code>style</code> attribute.
  </p>

  <h2>How it works</h2>
  <pre><code>// Get a style object — not a CSS string
const styles = theme.components.renderRecipe("buttons", "primary", { inline: true });
// → { background: "#4dabf7", color: "#fff", cursor: "pointer", border: "none", ... }

// Apply directly to the element
// React: &lt;button style={styles}&gt;Primary&lt;/button&gt;
// Vanilla: element.style.cssText = Object.entries(styles).map(...);</code></pre>

  <h2>Live demo — no &lt;style&gt; tags injected</h2>
  <div class="row">
    <button style="${toStyleString(btnPrimaryStyles)}">Primary</button>
    <button style="${toStyleString(btnDangerStyles)}">Danger</button>
  </div>
  <div class="row">
    <div style="${toStyleString(cardStyles)}">
      <strong>Card</strong>
      <p style="margin-top:8px">Styled entirely via inline style attribute.</p>
    </div>
  </div>

  <h2>What renderRecipe returns</h2>
  <div class="compare">
    <div>
      <h3>inline: true → style object</h3>
      <pre><code>theme.components.renderRecipe("buttons", "primary", { inline: true })

${JSON.stringify(btnPrimaryStyles, null, 2)}</code></pre>
    </div>
    <div>
      <h3>default → CSS string</h3>
      <pre><code>theme.components.renderRecipe("buttons", "primary")

${escapeHtml(defaultTheme.components.renderRecipe("buttons", "primary"))}</code></pre>
    </div>
  </div>

  <h2>Per-subsystem inline styles</h2>
  <pre><code>// Colors only
theme.colors.renderRecipe("solid", "primary", { inline: true })
${JSON.stringify(colorStyles, null, 2)}

// Full component (colors + typography + effects + layout + delta)
theme.components.renderRecipe("buttons", "primary", { inline: true })
${JSON.stringify(btnPrimaryStyles, null, 2)}</code></pre>

  <h2>Use cases</h2>
  <ul style="margin-bottom:1rem;color:#555;font-size:0.9rem;padding-left:1.5rem">
    <li>Email templates — email clients don't support &lt;style&gt; blocks</li>
    <li>React Native — <code>StyleSheet.create(styles)</code></li>
    <li>Server-rendered HTML snippets without global CSS</li>
    <li>Canvas or PDF rendering where CSS doesn't apply</li>
  </ul>
`;

function escapeHtml(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
