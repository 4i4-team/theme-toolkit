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
  h3 { margin: 1rem 0 0.5rem; font-size: 0.95rem; color: #555; }
  p { margin-bottom: 1rem; color: #555; font-size: 0.9rem; line-height: 1.6; }
  section { margin-bottom: 2rem; }
  .demo-box {
    background: #dee2e6; border-radius: 4px; padding: 0.5rem;
    text-align: center; font-size: 0.8rem; color: #495057;
  }
  .container-demo {
    background: #e9ecef; border: 2px dashed #adb5bd; border-radius: 8px;
    padding: 1rem; margin-bottom: 1rem; text-align: center;
    font-size: 0.8rem; color: #495057;
  }
  .col-demo {
    background: #4dabf7; color: #fff; border-radius: 4px; padding: 0.5rem;
    text-align: center; font-size: 0.75rem; font-weight: 600;
  }
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
  .filter(([key]) => !["recipes", "grids", "stacks", "container"].includes(key))
  .map(([key, value]) => {
    if (typeof value === "number") return `  ${key}: ${value},`;
    return `  ${key}: {\n${Object.entries(value as object).map(([k, v]) => `    ${k}: ${formatValue(v)},`).join("\n")}\n  },`;
  });

const containerBlock = rawTheme.layout.container
  ? `  container: {\n${Object.entries(rawTheme.layout.container).map(([k, v]) => `    ${k}: ${formatValue(v)},`).join("\n")}\n  },`
  : "";

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
  <h2>Raw input</h2>
  <pre><code>layout: {
${layoutEntries.join("\n")}
${containerBlock}
${specialEntries.join("\n")}
  recipes: {
${recipeLines.join("\n")}
  },
}</code></pre>
`;
app.appendChild(rawSection);

// --- Spacing tokens (visual bars) ---
const tokens = theme.layout.tokens as Record<string, { base: string | number; variants: Record<string, string | number> }>;
const spacingSection = document.createElement("section");
const spacingVariants = tokens?.spacing?.variants ?? {};
const maxSpacing = Math.max(...Object.values(spacingVariants).map(v => typeof v === "number" ? v : 0), 1);

spacingSection.innerHTML = `
  <h2>Spacing tokens</h2>
  <div style="display:flex;flex-direction:column;gap:6px">
    ${Object.entries(spacingVariants).map(([name, value]) => {
      const numVal = typeof value === "number" ? value : parseInt(String(value)) || 0;
      const widthPercent = Math.max((numVal / maxSpacing) * 100, 2);
      return `<div style="display:flex;align-items:center;gap:8px">
        <div style="width:70px;font-size:0.75rem;font-weight:600;text-align:right">${name}</div>
        <div style="height:24px;width:${widthPercent}%;background:#4dabf7;border-radius:4px;min-width:4px"></div>
        <div style="font-size:0.7rem;color:#666">${value}px</div>
      </div>`;
    }).join("")}
  </div>
  <p style="margin-top:0.5rem;font-size:0.8rem"><code>relaxed</code> changes at breakpoints: 32px → 20px (sm) → 40px (lg)</p>
`;
app.appendChild(spacingSection);

// --- Container demo ---
const containerSection = document.createElement("section");
containerSection.innerHTML = `
  <h2>Containers</h2>
  <p>Each container has <code>width: 100%; margin: auto;</code> with mode-specific max-width behavior. Resize to see fixed containers step.</p>

  <h3>.brand-container (fixed — steps through breakpoints)</h3>
  <div class="brand-container container-demo">
    Default container — max-width grows at each breakpoint
  </div>

  <h3>.brand-container-narrow (fixed — capped at md: 768px)</h3>
  <div class="brand-container-narrow container-demo">
    Narrow container — max-width caps at 768px
  </div>

  <h3>.brand-container-wide (fluid — max-width: 1600px)</h3>
  <div class="brand-container-wide container-demo">
    Wide container — 100% width, capped at 1600px, relaxed inset
  </div>

  <h3>.brand-container-full (fluid — no cap)</h3>
  <div class="brand-container-full container-demo">
    Full container — 100% width, no max-width
  </div>
`;
app.appendChild(containerSection);

// --- Columns demo ---
const colSection = document.createElement("section");
colSection.innerHTML = `
  <h2>12-column grid</h2>
  <p>Column span and offset classes generated per breakpoint. Using <code>.brand-col-xs-*</code> below.</p>

  <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:4px;margin-bottom:1rem">
    ${Array.from({ length: 12 }, (_, i) =>
      `<div class="brand-col-xs-1 col-demo">${i + 1}</div>`
    ).join("")}
  </div>

  <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:4px;margin-bottom:1rem">
    <div class="brand-col-xs-4 col-demo">col-4</div>
    <div class="brand-col-xs-4 col-demo">col-4</div>
    <div class="brand-col-xs-4 col-demo">col-4</div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:4px;margin-bottom:1rem">
    <div class="brand-col-xs-3 col-demo">col-3</div>
    <div class="brand-col-xs-6 col-demo">col-6</div>
    <div class="brand-col-xs-3 col-demo">col-3</div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:4px">
    <div class="brand-col-xs-8 col-demo">col-8</div>
    <div class="brand-col-xs-4 col-demo">col-4</div>
  </div>
`;
app.appendChild(colSection);

// --- Grid demo ---
const gridSection = document.createElement("section");
gridSection.innerHTML = `
  <h2>Grid presets</h2>
  <h3>.brand-grid-cards (auto-fit, wrapping)</h3>
  <div class="brand-grid-cards">
    ${Array.from({ length: 6 }, (_, i) => `<div class="demo-box">Card ${i + 1}</div>`).join("")}
  </div>
  <h3>.brand-grid-feature (responsive — 3 → 2 → 1 columns)</h3>
  <div class="brand-grid-feature">
    ${Array.from({ length: 3 }, (_, i) => `<div class="demo-box">Feature ${i + 1}</div>`).join("")}
  </div>
`;
app.appendChild(gridSection);

// --- Stack demo ---
const stackSection = document.createElement("section");
stackSection.innerHTML = `
  <h2>Stack presets</h2>
  <h3>.brand-stack-vertical</h3>
  <div class="brand-stack-vertical" style="max-width:300px">
    ${Array.from({ length: 3 }, (_, i) => `<div class="demo-box">Item ${i + 1}</div>`).join("")}
  </div>
  <h3>.brand-stack-horizontal (collapses at sm)</h3>
  <div class="brand-stack-horizontal">
    ${Array.from({ length: 4 }, (_, i) => `<div class="demo-box">Item ${i + 1}</div>`).join("")}
  </div>
  <h3>.brand-stack-pills (inline, wrapping)</h3>
  <div class="brand-stack-pills">
    ${["Design", "Code", "Test", "Ship", "Monitor", "Iterate"].map(t => `<div class="demo-box">${t}</div>`).join("")}
  </div>
`;
app.appendChild(stackSection);

// --- Classes + CSS ---
const classSection = document.createElement("section");
classSection.innerHTML = `
  <h2>Recipe classes</h2>
  <pre><code>${escapeHtml(JSON.stringify(theme.layout.classes, null, 2))}</code></pre>
  <h2>Generated CSS</h2>
  <pre><code>${escapeHtml(theme.css)}</code></pre>
`;
app.appendChild(classSection);

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
