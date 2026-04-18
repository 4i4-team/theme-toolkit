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
  .token-row { display: flex; gap: 0; border-radius: 8px; overflow: hidden; }
  .token-swatch {
    flex: 1 1 0; height: 50px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; font-size: 0.65rem;
    font-weight: 600; gap: 2px; overflow: hidden; background: #e9ecef;
  }
  .token-swatch span { opacity: 0.7; font-weight: 400; font-size: 0.6rem; }
  .demo-box { background: #dee2e6; border-radius: 4px; padding: 0.5rem; text-align: center; font-size: 0.8rem; color: #495057; }
  .grid { display: flex; gap: 1rem; flex-wrap: wrap; }
  pre {
    background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px;
    overflow-x: auto; font-size: 0.8rem; line-height: 1.5;
  }
`;
document.head.appendChild(baseStyle);

const app = document.getElementById("app")!;
app.innerHTML = `<h1>Layout Example <small>vanilla TS, no framework</small></h1>`;

// --- Raw input ---
const rawSection = document.createElement("section");
const layoutEntries = Object.entries(rawTheme.layout)
  .filter(([key]) => key !== "recipes" && key !== "grids" && key !== "stacks")
  .map(([key, value]) => {
    if (typeof value === "number") return `  ${key}: ${value},`;
    return `  ${key}: ${formatValue(value)},`;
  });

const specialEntries = ["grids", "stacks"].map(key => {
  const value = (rawTheme.layout as any)[key];
  if (!value) return "";
  const names = Object.keys(value);
  return `  ${key}: { ${names.map(n => `${n}: {...}`).join(", ")} },`;
}).filter(Boolean);

const recipeGroups = Object.entries((rawTheme.layout as any).recipes ?? {});
const recipeLines = recipeGroups.map(([group, variants]) =>
  `    ${group}: { ${Object.keys(variants as any).map(v => `${v}: {...}`).join(", ")} },`
);

rawSection.innerHTML = `
  <h2>Raw input (rawTheme.layout)</h2>
  <pre><code>layout: {
${layoutEntries.join("\n")}
${specialEntries.join("\n")}
  recipes: {
${recipeLines.join("\n")}
  },
}</code></pre>
`;
app.appendChild(rawSection);

// --- Spacing tokens ---
const tokens = theme.layout.tokens as Record<string, { base: string | number; variants: Record<string, string | number> }>;
const spacingSection = document.createElement("section");
const spacingVariants = tokens?.spacing?.variants ?? {};
spacingSection.innerHTML = `
  <h2>Spacing tokens</h2>
  <div class="token-row">
    ${Object.entries(spacingVariants).map(([name, value]) =>
      `<div class="token-swatch" style="width:${typeof value === "number" ? value : 0}px;min-width:60px">
        ${name}<span>${value}px</span>
      </div>`
    ).join("")}
  </div>
`;
app.appendChild(spacingSection);

// --- Grid demo ---
const gridSection = document.createElement("section");
gridSection.innerHTML = `
  <h2>Grid: cards (className-based)</h2>
  <div class="brand-grid-cards">
    ${Array.from({ length: 6 }, (_, i) => `<div class="demo-box">Card ${i + 1}</div>`).join("")}
  </div>
  <h2>Grid: feature (responsive — resize to test)</h2>
  <div class="brand-grid-feature">
    ${Array.from({ length: 3 }, (_, i) => `<div class="demo-box">Feature ${i + 1}</div>`).join("")}
  </div>
`;
app.appendChild(gridSection);

// --- Stack demo ---
const stackSection = document.createElement("section");
stackSection.innerHTML = `
  <h2>Stack: vertical</h2>
  <div class="brand-stack-vertical" style="max-width:300px">
    ${Array.from({ length: 3 }, (_, i) => `<div class="demo-box">Item ${i + 1}</div>`).join("")}
  </div>
  <h2>Stack: horizontal (collapses at sm — resize to test)</h2>
  <div class="brand-stack-horizontal">
    ${Array.from({ length: 4 }, (_, i) => `<div class="demo-box">Item ${i + 1}</div>`).join("")}
  </div>
  <h2>Stack: pills (inline, wrapping)</h2>
  <div class="brand-stack-pills">
    ${["Design", "Code", "Test", "Ship", "Monitor", "Iterate"].map(t => `<div class="demo-box">${t}</div>`).join("")}
  </div>
`;
app.appendChild(stackSection);

// --- Recipe classes ---
const classSection = document.createElement("section");
classSection.innerHTML = `
  <h2>Recipe classes</h2>
  <pre><code>${escapeHtml(JSON.stringify(theme.layout.classes, null, 2))}</code></pre>
`;
app.appendChild(classSection);

// --- Responsive ---
const responsiveSection = document.createElement("section");
responsiveSection.innerHTML = `
  <h2>Responsive</h2>
  <p>Resize the window to see:</p>
  <ul style="margin:0.5rem 0 1rem 1.5rem;font-size:0.9rem;color:#555;line-height:1.8">
    <li><code>spacing.relaxed</code> changes from 32px → 20px (sm) → 40px (lg) via CSS variable override</li>
    <li><code>grid.feature</code> collapses from 3 → 2 → 1 columns</li>
    <li><code>stack.horizontal</code> switches to column direction at sm</li>
  </ul>
`;
app.appendChild(responsiveSection);

// --- Generated CSS ---
const cssSection = document.createElement("section");
cssSection.innerHTML = `
  <h2>Generated CSS</h2>
  <pre><code>${escapeHtml(theme.css)}</code></pre>
`;
app.appendChild(cssSection);

function formatValue(v: unknown): string {
  if (v === undefined || v === null) return String(v);
  if (typeof v === "string") return `"${v}"`;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return `[${v.map(formatValue).join(", ")}]`;
  if (typeof v === "object") {
    const entries = Object.entries(v as Record<string, unknown>);
    return `{ ${entries.map(([k, val]) => `${k}: ${formatValue(val)}`).join(", ")} }`;
  }
  return String(v);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
