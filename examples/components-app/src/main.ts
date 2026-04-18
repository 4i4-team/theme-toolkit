import { theme, rawTheme } from "./theme";

const style = document.createElement("style");
style.textContent = theme.css;
document.head.appendChild(style);

const baseStyle = document.createElement("style");
baseStyle.textContent = `
  * { margin: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; padding: 2rem; background: #f8f9fa; color: #1d1d1f; }
  h1 { margin-bottom: 0.5rem; }
  h1 small { font-weight: 400; font-size: 0.8rem; color: #666; }
  h2 { margin: 2rem 0 0.75rem; font-size: 1.1rem; }
  p { margin-bottom: 1rem; color: #555; font-size: 0.9rem; line-height: 1.6; }
  section { margin-bottom: 2rem; }
  .row { display: flex; gap: 12px; flex-wrap: wrap; align-items: start; }
  pre {
    background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px;
    overflow-x: auto; font-size: 0.8rem; line-height: 1.5;
  }
  .demo-card { min-width: 200px; }
  .demo-btn { font-size: 1rem; }
`;
document.head.appendChild(baseStyle);

const app = document.getElementById("app")!;
app.innerHTML = `<h1>Components (Composition) Example <small>vanilla TS, no framework</small></h1>
<p>The components subsystem composes recipes from colors, typography, layout, and effects into unified component class names.</p>`;

// --- Raw input ---
const rawSection = document.createElement("section");
const componentRecipes = (rawTheme.components as any)?.recipes ?? {};
const recipeLines = Object.entries(componentRecipes).map(([group, variants]) => {
  const variantLines = Object.entries(variants as Record<string, any>).map(([v, props]) => {
    const propEntries = Object.entries(props)
      .map(([k, val]) => {
        if (typeof val === "object") return `${k}: { ... }`;
        return `${k}: "${val}"`;
      })
      .join(", ");
    return `      ${v}: { ${propEntries} }`;
  });
  return `    ${group}: {\n${variantLines.join(",\n")}\n    }`;
});

rawSection.innerHTML = `
  <h2>Raw input</h2>
  <pre><code>components: {
  recipes: {
${recipeLines.join(",\n")}
  }
}</code></pre>
`;
app.appendChild(rawSection);

// --- Button demos ---
const buttonSection = document.createElement("section");
const buttonClasses = (theme.components.classes as any)?.buttons ?? {};
buttonSection.innerHTML = `
  <h2>Button components</h2>
  <p>Each button composes colors + typography + layout + effects recipes, plus CSS overrides for cursor, border, display.</p>
  <div class="row">
    ${Object.entries(buttonClasses)
      .map(
        ([name, cls]: [string, any]) =>
          `<button class="demo-btn ${cls.className}">
        ${name}
      </button>`,
      )
      .join("")}
  </div>
`;
app.appendChild(buttonSection);

// --- Card demos ---
const cardSection = document.createElement("section");
const cardClasses = (theme.components.classes as any)?.cards ?? {};
cardSection.innerHTML = `
  <h2>Card components</h2>
  <p>Cards compose effects (radius, shadow) + layout (padding) + optional colors/typography.</p>
  <div class="row">
    ${Object.entries(cardClasses)
      .map(
        ([name, cls]: [string, any]) =>
          `<div class="demo-card ${cls.className}">
        <strong>${name}</strong>
        <p style="margin-top:8px;font-size:0.85rem;opacity:0.8">A ${name} card component</p>
      </div>`,
      )
      .join("")}
  </div>
`;
app.appendChild(cardSection);

// --- Resolved classes ---
const classSection = document.createElement("section");
const allClasses = theme.components.classes as Record<string, Record<string, { classes: string[]; className: string }>>;
const classLines: string[] = [];
for (const [group, variants] of Object.entries(allClasses)) {
  for (const [variant, data] of Object.entries(variants)) {
    classLines.push(`${group}.${variant}:`);
    classLines.push(`  className: "${data.className}"`);
    classLines.push(`  classes: [${data.classes.map((c) => `"${c}"`).join(", ")}]`);
    classLines.push("");
  }
}

classSection.innerHTML = `
  <h2>Resolved class names</h2>
  <p>Each component variant resolves referenced subsystem recipe classes and generates a delta class for CSS overrides.</p>
  <pre><code>${classLines.join("\n")}</code></pre>
`;
app.appendChild(classSection);

// --- getClass usage ---
const getClassSection = document.createElement("section");
getClassSection.innerHTML = `
  <h2>getClass() usage</h2>
  <pre><code>theme.components.getClass("buttons", "primary")
// "${theme.components.getClass("buttons", "primary")}"

theme.components.getClass("cards", "elevated")
// "${theme.components.getClass("cards", "elevated")}"

theme.components.getClass("cards", "hero")
// "${theme.components.getClass("cards", "hero")}"</code></pre>
`;
app.appendChild(getClassSection);

// --- Generated CSS ---
const cssSection = document.createElement("section");
const css = theme.css;
const cssLines2 = css.split("\n");
const compStart = cssLines2.findIndex((l) => l.includes("brand-comp"));
const compEnd = compStart >= 0 ? cssLines2.findIndex((l, i) => i > compStart && l.trim() === "" && cssLines2[i + 1]?.trim() === "") : -1;
const compCss =
  compStart >= 0 ? cssLines2.slice(compStart, compEnd > 0 ? compEnd : undefined).join("\n") : "No component CSS found";

cssSection.innerHTML = `
  <h2>Component delta CSS</h2>
  <p>Only the <code>css:</code> overrides generate new rules. Referenced subsystem classes are reused as-is.</p>
  <pre><code>${escapeHtml(compCss)}</code></pre>
  <h2>Full generated CSS</h2>
  <pre><code>${escapeHtml(css)}</code></pre>
`;
app.appendChild(cssSection);

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
