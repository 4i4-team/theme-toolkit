import { defaultTheme, inlineTheme, scopedTheme } from "./theme";

// --- Base styles ---
const baseStyle = document.createElement("style");
baseStyle.textContent = `
  * { margin: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; padding: 2rem; background: #f8f9fa; color: #1d1d1f; }
  h1 { margin-bottom: 0.5rem; }
  h1 small { font-weight: 400; font-size: 0.8rem; color: #666; }
  h2 { margin: 2rem 0 0.75rem; font-size: 1.1rem; }
  h3 { margin: 1.5rem 0 0.5rem; font-size: 0.95rem; }
  p { margin-bottom: 1rem; color: #555; font-size: 0.9rem; line-height: 1.6; }
  section { margin-bottom: 2.5rem; }
  .tabs { display: flex; gap: 4px; border-bottom: 1px solid #dee2e6; margin-bottom: 1.5rem; }
  .tab { padding: 10px 16px; border: none; background: transparent; cursor: pointer;
    font-size: 0.9rem; color: #495057; border-bottom: 2px solid transparent; }
  .tab.active { font-weight: 600; color: #1c7ed6; border-bottom-color: #1c7ed6; }
  .row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
  pre { background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px;
    overflow-x: auto; font-size: 0.75rem; line-height: 1.5; margin-bottom: 16px; max-height: 300px; }
  .demo-area { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 24px; margin-bottom: 16px; }
  .label { font-size: 0.75rem; color: #868e96; margin-bottom: 4px; }
  .style-tag { background: #e3f2fd; border: 1px solid #90caf9; border-radius: 4px;
    padding: 2px 6px; font-size: 0.7rem; font-family: monospace; color: #1565c0; display: inline-block; margin-bottom: 8px; }
`;
document.head.appendChild(baseStyle);

const app = document.getElementById("app")!;
app.innerHTML = `<h1>Delivery Styles <small>same theme, different output strategies</small></h1>
<p>All examples use the same raw theme input. The adapter controls how CSS is rendered.</p>`;

// --- Tabs ---
const tabs = [
  { id: "single", label: "1. Single Global" },
  { id: "split", label: "2. Split Vars/Rules" },
  { id: "per-recipe", label: "3. Per-Recipe" },
  { id: "inline", label: "4. Inline Values" },
  { id: "scoped", label: "5. Scoped (MFE)" },
  { id: "per-component", label: "6. Per-Component" },
];

const tabBar = document.createElement("div");
tabBar.className = "tabs";
tabs.forEach(tab => {
  const btn = document.createElement("button");
  btn.className = "tab";
  btn.textContent = tab.label;
  btn.dataset.tab = tab.id;
  btn.addEventListener("click", () => showTab(tab.id));
  tabBar.appendChild(btn);
});
app.appendChild(tabBar);

const content = document.createElement("div");
app.appendChild(content);

function showTab(id: string) {
  tabBar.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.getAttribute("data-tab") === id));
  switch (id) {
    case "single": renderSingleGlobal(); break;
    case "split": renderSplit(); break;
    case "per-recipe": renderPerRecipe(); break;
    case "inline": renderInline(); break;
    case "scoped": renderScoped(); break;
    case "per-component": renderPerComponent(); break;
  }
}

// --- 1. Single Global CSS ---
function renderSingleGlobal() {
  const style = injectStyle("single-global", defaultTheme.css);
  content.innerHTML = `
    <section>
      <h2>Single Global CSS</h2>
      <p>One <code>&lt;style&gt;</code> tag with all variables + all recipe rules. Current default behavior.</p>
      <span class="style-tag">&lt;style&gt; ${defaultTheme.css.length} chars</span>

      <h3>Live demo</h3>
      <div class="demo-area">
        <div class="row">
          <button class="${defaultTheme.components.getClass("buttons", "primary")}">Primary</button>
          <button class="${defaultTheme.components.getClass("buttons", "danger")}">Danger</button>
        </div>
        <div class="row">
          <div class="${defaultTheme.components.getClass("cards", "default")}">Default card</div>
          <div class="${defaultTheme.components.getClass("cards", "elevated")}">Elevated card</div>
        </div>
      </div>

      <h3>Code</h3>
      <pre><code>const theme = createTheme(rawTheme, options);

// Inject once
const style = document.createElement("style");
style.textContent = theme.css;
document.head.appendChild(style);</code></pre>

      <h3>Generated CSS</h3>
      <pre><code>${esc(defaultTheme.css)}</code></pre>
    </section>
  `;
}

// --- 2. Split Variables + Rules ---
function renderSplit() {
  const varsCss = defaultTheme.variablesCss;
  const rulesCss = defaultTheme.recipesCss;
  injectStyle("split-vars", varsCss);
  injectStyle("split-rules", rulesCss);
  content.innerHTML = `
    <section>
      <h2>Split: Variables + Rules</h2>
      <p>Two separate <code>&lt;style&gt;</code> tags. Variables load first and are always available. Rules can be deferred or lazy-loaded.</p>
      <span class="style-tag">&lt;style data-vars&gt; ${varsCss.length} chars</span>
      <span class="style-tag">&lt;style data-rules&gt; ${rulesCss.length} chars</span>

      <h3>Live demo</h3>
      <div class="demo-area">
        <div class="row">
          <button class="${defaultTheme.components.getClass("buttons", "primary")}">Primary</button>
          <button class="${defaultTheme.components.getClass("buttons", "danger")}">Danger</button>
        </div>
      </div>

      <h3>Code</h3>
      <pre><code>// Variables — inject immediately
const varsStyle = document.createElement("style");
varsStyle.textContent = theme.variablesCss;
document.head.appendChild(varsStyle);

// Rules — can be deferred/lazy-loaded
const rulesStyle = document.createElement("style");
rulesStyle.textContent = theme.recipesCss;
document.head.appendChild(rulesStyle);</code></pre>

      <h3>Variables CSS</h3>
      <pre><code>${esc(varsCss)}</code></pre>
      <h3>Rules CSS</h3>
      <pre><code>${esc(rulesCss)}</code></pre>
    </section>
  `;
}

// --- 3. Per-Recipe ---
function renderPerRecipe() {
  const solidPrimary = defaultTheme.colors.renderRecipe("solid", "primary");
  const cardDefault = defaultTheme.effects.renderRecipe("card", "default");
  const cardElevated = defaultTheme.effects.renderRecipe("card", "elevated");
  injectStyle("recipe-solid", solidPrimary);
  injectStyle("recipe-card-default", cardDefault);
  injectStyle("recipe-card-elevated", cardElevated);

  content.innerHTML = `
    <section>
      <h2>Per-Recipe CSS</h2>
      <p>Each recipe rendered individually with only its required variables. Inject per component on mount — PrimeNG style.</p>

      <h3>colors.renderRecipe("solid", "primary")</h3>
      <span class="style-tag">&lt;style&gt; ${solidPrimary.length} chars</span>
      <pre><code>${esc(solidPrimary)}</code></pre>

      <h3>effects.renderRecipe("card", "default")</h3>
      <span class="style-tag">&lt;style&gt; ${cardDefault.length} chars</span>
      <pre><code>${esc(cardDefault)}</code></pre>

      <h3>effects.renderRecipe("card", "elevated")</h3>
      <span class="style-tag">&lt;style&gt; ${cardElevated.length} chars</span>
      <pre><code>${esc(cardElevated)}</code></pre>

      <h3>Code</h3>
      <pre><code>// On component mount — inject only what this component needs
const css = theme.colors.renderRecipe("solid", "primary");
const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);</code></pre>
    </section>
  `;
}

// --- 4. Inline Values ---
function renderInline() {
  const inlineSolid = inlineTheme.colors.renderRecipe("solid", "primary");
  const inlineButton = inlineTheme.components.renderRecipe("buttons", "primary");
  injectStyle("inline-solid", inlineSolid);
  injectStyle("inline-button", inlineButton);

  content.innerHTML = `
    <section>
      <h2>Inline Values</h2>
      <p>No CSS variables at all. Resolved values baked directly into declarations. Use for email templates, static exports, or environments without <code>var(--)</code> support.</p>

      <h3>Adapter setup</h3>
      <pre><code>const theme = createTheme(rawTheme, {
  ...options,
  adapter: createCssAdapter({ inline: true }),
});</code></pre>

      <h3>Full theme CSS (inline)</h3>
      <span class="style-tag">&lt;style&gt; ${inlineTheme.css.length} chars (vs ${defaultTheme.css.length} default)</span>
      <pre><code>${esc(inlineTheme.css)}</code></pre>

      <h3>colors.renderRecipe("solid", "primary")</h3>
      <pre><code>${esc(inlineSolid)}</code></pre>

      <h3>components.renderRecipe("buttons", "primary") — cross-subsystem inline</h3>
      <pre><code>${esc(inlineButton)}</code></pre>
    </section>
  `;
}

// --- 5. Scoped (MFE) ---
function renderScoped() {
  const scopedSolid = scopedTheme.colors.renderRecipe("solid", "primary");
  injectStyle("scoped-full", scopedTheme.css);

  content.innerHTML = `
    <section>
      <h2>Scoped Variables (MFE)</h2>
      <p>Variable names prefixed with a scope to prevent collisions between micro-frontends on the same page.</p>

      <h3>Adapter setup</h3>
      <pre><code>const theme = createTheme(rawTheme, {
  ...options,
  adapter: createCssAdapter({ scope: "widget" }),
});
// --app-colors-primary → --widget-colors-primary</code></pre>

      <h3>Live demo</h3>
      <div class="demo-area">
        <div class="row">
          <button class="${scopedTheme.components.getClass("buttons", "primary")}">Scoped Primary</button>
        </div>
      </div>

      <h3>Full theme CSS (scoped)</h3>
      <pre><code>${esc(scopedTheme.css)}</code></pre>

      <h3>Per-recipe (scoped)</h3>
      <pre><code>${esc(scopedSolid)}</code></pre>

      <h3>Per-recipe override: scoped adapter + inline per-call</h3>
      <pre><code>${esc(scopedTheme.colors.renderRecipe("solid", "primary", { inline: true }))}</code></pre>
    </section>
  `;
}

// --- 6. Per-Component (cross-subsystem) ---
function renderPerComponent() {
  const btnPrimary = defaultTheme.components.renderRecipe("buttons", "primary");
  const btnDanger = defaultTheme.components.renderRecipe("buttons", "danger");
  const cardDefault = defaultTheme.components.renderRecipe("cards", "default");
  const cardElevated = defaultTheme.components.renderRecipe("cards", "elevated");
  injectStyle("comp-btn-primary", btnPrimary);
  injectStyle("comp-btn-danger", btnDanger);
  injectStyle("comp-card-default", cardDefault);
  injectStyle("comp-card-elevated", cardElevated);

  content.innerHTML = `
    <section>
      <h2>Per-Component (Cross-Subsystem)</h2>
      <p>Each component recipe pulls CSS from all referenced subsystems (colors + typography + effects + layout + delta). One <code>&lt;style&gt;</code> tag per component with everything it needs.</p>

      <h3>Live demo</h3>
      <div class="demo-area">
        <div class="row">
          <button class="${defaultTheme.components.getClass("buttons", "primary")}">Primary</button>
          <button class="${defaultTheme.components.getClass("buttons", "danger")}">Danger</button>
        </div>
        <div class="row">
          <div class="${defaultTheme.components.getClass("cards", "default")}">Default card</div>
          <div class="${defaultTheme.components.getClass("cards", "elevated")}">Elevated card</div>
        </div>
      </div>

      <h3>components.renderRecipe("buttons", "primary")</h3>
      <span class="style-tag">&lt;style&gt; ${btnPrimary.length} chars</span>
      <pre><code>${esc(btnPrimary)}</code></pre>

      <h3>components.renderRecipe("buttons", "danger")</h3>
      <span class="style-tag">&lt;style&gt; ${btnDanger.length} chars</span>
      <pre><code>${esc(btnDanger)}</code></pre>

      <h3>components.renderRecipe("cards", "elevated")</h3>
      <span class="style-tag">&lt;style&gt; ${cardElevated.length} chars</span>
      <pre><code>${esc(cardElevated)}</code></pre>

      <h3>Code</h3>
      <pre><code>// Component mounts → inject its CSS bundle
function mountButton(variant: string) {
  const css = theme.components.renderRecipe("buttons", variant);
  const style = document.createElement("style");
  style.dataset.component = \`button-\${variant}\`;
  style.textContent = css;
  document.head.appendChild(style);
}</code></pre>
    </section>
  `;
}

// --- Helpers ---
const injectedStyles = new Map<string, HTMLStyleElement>();

function injectStyle(id: string, css: string): HTMLStyleElement {
  let el = injectedStyles.get(id);
  if (!el) {
    el = document.createElement("style");
    el.dataset.delivery = id;
    document.head.appendChild(el);
    injectedStyles.set(id, el);
  }
  el.textContent = css;
  return el;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Show first tab
showTab("single");
