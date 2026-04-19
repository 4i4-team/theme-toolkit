import { hostTheme, widgetTheme } from "./theme";

// --- Delivery: two MFEs on the same page, each with scoped variables ---

// Each MFE injects its own scoped CSS
const hostStyle = document.createElement("style");
hostStyle.dataset.mfe = "host";
hostStyle.textContent = hostTheme.css;
document.head.appendChild(hostStyle);

const widgetStyle = document.createElement("style");
widgetStyle.dataset.mfe = "widget";
widgetStyle.textContent = widgetTheme.css;
document.head.appendChild(widgetStyle);

document.head.appendChild(Object.assign(document.createElement("style"), {
  textContent: `
    * { margin: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #f8f9fa; color: #1d1d1f; }
    h1 { margin-bottom: 0.5rem; }
    h1 small { font-weight: 400; font-size: 0.8rem; color: #666; }
    h2 { margin: 1.5rem 0 0.75rem; font-size: 1.1rem; }
    p { margin-bottom: 1rem; color: #555; font-size: 0.9rem; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; align-items: start; margin-bottom: 16px; }
    pre { background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px; overflow: auto; font-size: 0.75rem; line-height: 1.5; margin-bottom: 16px; max-height: 250px; }
    .mfe-frame { border: 2px solid #dee2e6; border-radius: 8px; padding: 24px; margin-bottom: 16px; }
    .mfe-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #868e96; margin-bottom: 12px; }
    .mfe-host { border-color: #74c0fc; }
    .mfe-widget { border-color: #69db7c; }
    .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 700px) { .columns { grid-template-columns: 1fr; } }
  `,
}));

const app = document.getElementById("app")!;
app.innerHTML = `
  <h1>Delivery: Scoped Variables <small>MFE isolation</small></h1>
  <p>
    Two micro-frontends on the same page, each with its own CSS variable scope.
    <code>--host-*</code> and <code>--widget-*</code> never collide.
  </p>

  <h2>Live demo — two MFEs side by side</h2>
  <div class="columns">
    <div class="mfe-frame mfe-host">
      <div class="mfe-label">Host App (scope: "host")</div>
      <div class="row">
        <button class="${hostTheme.components.getClass("buttons", "primary")}">Host Primary</button>
        <button class="${hostTheme.components.getClass("buttons", "danger")}">Host Danger</button>
      </div>
      <div class="${hostTheme.components.getClass("cards", "default")}">
        <strong>Host card</strong>
        <p style="margin-top:8px;font-size:0.85rem">Uses --host-* variables</p>
      </div>
    </div>
    <div class="mfe-frame mfe-widget">
      <div class="mfe-label">Widget (scope: "widget")</div>
      <div class="row">
        <button class="${widgetTheme.components.getClass("buttons", "primary")}">Widget Primary</button>
        <button class="${widgetTheme.components.getClass("buttons", "danger")}">Widget Danger</button>
      </div>
      <div class="${widgetTheme.components.getClass("cards", "elevated")}">
        <strong>Widget card</strong>
        <p style="margin-top:8px;font-size:0.85rem">Uses --widget-* variables</p>
      </div>
    </div>
  </div>

  <h2>How it works</h2>
  <pre><code>import { createTheme, createCssAdapter } from "@theme-registry/theme-kit";

// Host app
const hostTheme = createTheme(rawTheme, {
  ...options,
  adapter: createCssAdapter({ scope: "host" }),
});

// Embedded widget — different scope, no collisions
const widgetTheme = createTheme(rawTheme, {
  ...options,
  adapter: createCssAdapter({ scope: "widget" }),
});

// Each MFE injects its own CSS
document.head.appendChild(hostStyle);   // --host-colors-primary, --host-effects-radius, etc.
document.head.appendChild(widgetStyle); // --widget-colors-primary, --widget-effects-radius, etc.</code></pre>

  <h2>Host CSS variables (first 5 lines)</h2>
  <pre><code>${escapeHtml(hostTheme.variablesCss.split("\n").slice(0, 7).join("\n"))}
...</code></pre>

  <h2>Widget CSS variables (first 5 lines)</h2>
  <pre><code>${escapeHtml(widgetTheme.variablesCss.split("\n").slice(0, 7).join("\n"))}
...</code></pre>
`;

function escapeHtml(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
