import { theme } from "./theme";

// --- Delivery: variables injected immediately, recipes loaded per "route" ---

// Step 1: Variables are always available — inject at app root
const varsStyle = document.createElement("style");
varsStyle.dataset.role = "variables";
varsStyle.textContent = theme.variablesCss;
document.head.appendChild(varsStyle);

// Base styles
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
    nav { display: flex; gap: 4px; border-bottom: 1px solid #dee2e6; margin-bottom: 1.5rem; }
    nav button { padding: 10px 16px; border: none; background: transparent; cursor: pointer; font-size: 0.9rem; color: #495057; border-bottom: 2px solid transparent; }
    nav button.active { font-weight: 600; color: #1c7ed6; border-bottom-color: #1c7ed6; }
    .info { background: #e7f5ff; border: 1px solid #74c0fc; border-radius: 6px; padding: 12px 16px; font-size: 0.85rem; color: #1864ab; margin-bottom: 16px; }
  `,
}));

const app = document.getElementById("app")!;
app.innerHTML = `
  <h1>Delivery: Split Variables / Rules <small>lazy-load recipes per route</small></h1>
  <p>Variables injected globally. Recipe rules loaded only when a "route" activates — simulating code-splitting.</p>
`;

// --- Simulate route-based lazy loading ---
const nav = document.createElement("nav");
const content = document.createElement("div");
app.appendChild(nav);
app.appendChild(content);

const routes: Record<string, { loaded: boolean; styleEl?: HTMLStyleElement }> = {
  buttons: { loaded: false },
  cards: { loaded: false },
};

function createTab(name: string) {
  const btn = document.createElement("button");
  btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  btn.addEventListener("click", () => loadRoute(name));
  nav.appendChild(btn);
}

createTab("buttons");
createTab("cards");

function loadRoute(name: string) {
  nav.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.textContent?.toLowerCase() === name));

  const route = routes[name];

  // Step 2: Inject recipe CSS for this route (if not already loaded)
  if (!route.loaded) {
    const recipeCss = name === "buttons"
      ? [
          theme.colors.renderRecipe("solid", "primary", { includeVariables: false }),
          theme.colors.renderRecipe("solid", "danger", { includeVariables: false }),
          theme.components.renderRecipe("buttons", "primary", { includeVariables: false }),
          theme.components.renderRecipe("buttons", "danger", { includeVariables: false }),
        ].join("\n\n")
      : [
          theme.components.renderRecipe("cards", "default", { includeVariables: false }),
          theme.components.renderRecipe("cards", "elevated", { includeVariables: false }),
        ].join("\n\n");

    route.styleEl = document.createElement("style");
    route.styleEl.dataset.route = name;
    route.styleEl.textContent = recipeCss;
    document.head.appendChild(route.styleEl);
    route.loaded = true;
  }

  // Render route content
  if (name === "buttons") {
    content.innerHTML = `
      <div class="info">Recipe CSS for this route was ${route.loaded ? "just injected" : "already loaded"} — <code>&lt;style data-route="buttons"&gt;</code></div>
      <div class="row">
        <button class="${theme.components.getClass("buttons", "primary")}">Primary</button>
        <button class="${theme.components.getClass("buttons", "danger")}">Danger</button>
      </div>
      <h2>Recipe CSS loaded for this route</h2>
      <pre><code>${escapeHtml(route.styleEl!.textContent!)}</code></pre>
    `;
  } else {
    content.innerHTML = `
      <div class="info">Recipe CSS for this route was ${route.loaded ? "just injected" : "already loaded"} — <code>&lt;style data-route="cards"&gt;</code></div>
      <div class="row">
        <div class="${theme.components.getClass("cards", "default")}"><strong>Default card</strong></div>
        <div class="${theme.components.getClass("cards", "elevated")}"><strong>Elevated card</strong></div>
      </div>
      <h2>Recipe CSS loaded for this route</h2>
      <pre><code>${escapeHtml(route.styleEl!.textContent!)}</code></pre>
    `;
  }
}

// Add explanation
const explanation = document.createElement("div");
explanation.innerHTML = `
  <h2>How it works</h2>
  <pre><code>// At app root — variables always available
const varsStyle = document.createElement("style");
varsStyle.textContent = theme.variablesCss;
document.head.appendChild(varsStyle);

// Per route — inject only the recipes this route needs
// includeVariables: false because variables are already global
function loadRoute(name) {
  const css = theme.components.renderRecipe("buttons", "primary", {
    includeVariables: false,   // ← variables already injected globally
  });
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}</code></pre>
`;
app.appendChild(explanation);

loadRoute("buttons");

function escapeHtml(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
