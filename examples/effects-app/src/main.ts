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
  .swatch {
    width: 80px; height: 60px; background: #fff; display: flex;
    flex-direction: column; align-items: center; justify-content: center;
    font-size: 0.65rem; font-weight: 600; gap: 2px;
  }
  .swatch span { opacity: 0.7; font-weight: 400; font-size: 0.6rem; }
  .card-demo {
    width: 160px; height: 100px; background: #fff; display: flex;
    align-items: center; justify-content: center; font-size: 0.8rem; color: #495057;
  }
  pre {
    background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px;
    overflow-x: auto; font-size: 0.8rem; line-height: 1.5;
  }
`;
document.head.appendChild(baseStyle);

const app = document.getElementById("app")!;
app.innerHTML = `<h1>Effects Example <small>vanilla TS, no framework</small></h1>`;

const tokens = theme.effects.tokens as Record<string, { base: string | number; variants: Record<string, string | number> }>;

// --- Raw input ---
const rawSection = document.createElement("section");
const entries = Object.entries(rawTheme.effects)
  .filter(([key]) => key !== "recipes")
  .map(([key, value]) => `  ${key}: {\n${Object.entries(value as object).map(([k, v]) => `    ${k}: ${formatValue(v)},`).join("\n")}\n  },`);
const recipeGroups = Object.entries((rawTheme.effects as any).recipes ?? {});
const recipeLines = recipeGroups.map(([group, variants]) =>
  `    ${group}: { ${Object.keys(variants as any).map(v => `${v}: {...}`).join(", ")} },`
);
rawSection.innerHTML = `
  <h2>Raw input</h2>
  <pre><code>effects: {
${entries.join("\n")}
  recipes: {
${recipeLines.join("\n")}
  },
}</code></pre>
`;
app.appendChild(rawSection);

// --- Radius ---
const radiusSection = document.createElement("section");
const radiusVariants = tokens?.radius?.variants ?? {};
radiusSection.innerHTML = `
  <h2>Border radius</h2>
  <div class="row">
    ${Object.entries(radiusVariants).map(([name, value]) =>
      `<div class="swatch" style="border-radius:${typeof value === "number" ? value + "px" : value};border:2px solid #dee2e6">
        ${name}<span>${value}${typeof value === "number" ? "px" : ""}</span>
      </div>`
    ).join("")}
  </div>
`;
app.appendChild(radiusSection);

// --- Shadows ---
const shadowSection = document.createElement("section");
const shadowVariants = tokens?.shadow?.variants ?? {};
shadowSection.innerHTML = `
  <h2>Shadows</h2>
  <div class="row">
    ${Object.entries(shadowVariants).map(([name, value]) =>
      `<div class="swatch" style="box-shadow:${value};border-radius:8px">
        ${name}<span style="max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${value}</span>
      </div>`
    ).join("")}
  </div>
`;
app.appendChild(shadowSection);

// --- Opacity ---
const opacitySection = document.createElement("section");
const opacityVariants = tokens?.opacity?.variants ?? {};
opacitySection.innerHTML = `
  <h2>Opacity</h2>
  <div class="row">
    ${Object.entries(opacityVariants).map(([name, value]) =>
      `<div class="swatch" style="opacity:${value};background:#4dabf7;color:#fff;border-radius:6px">
        ${name}<span>${value}</span>
      </div>`
    ).join("")}
  </div>
`;
app.appendChild(opacitySection);

// --- Border width ---
const bwSection = document.createElement("section");
const bwVariants = tokens?.borderWidth?.variants ?? {};
bwSection.innerHTML = `
  <h2>Border width</h2>
  <div class="row">
    ${Object.entries(bwVariants).map(([name, value]) =>
      `<div class="swatch" style="border:${typeof value === "number" ? value + "px" : value} solid #495057;border-radius:6px">
        ${name}<span>${value}${typeof value === "number" ? "px" : ""}</span>
      </div>`
    ).join("")}
  </div>
`;
app.appendChild(bwSection);

// --- Outline ---
const outlineSection = document.createElement("section");
const outlineVariants = tokens?.outline?.variants ?? {};
outlineSection.innerHTML = `
  <h2>Outline / Ring</h2>
  <div class="row">
    ${Object.entries(outlineVariants).map(([name, value]) =>
      `<div class="swatch" style="outline:${value};outline-offset:2px;border-radius:6px;background:#fff">
        ${name}
      </div>`
    ).join("")}
  </div>
`;
app.appendChild(outlineSection);

// --- Recipe card demos ---
const recipeSection = document.createElement("section");
const cardClasses = theme.effects.classes?.card ?? {};
const focusClasses = theme.effects.classes?.focus ?? {};
const stateClasses = theme.effects.classes?.state ?? {};
recipeSection.innerHTML = `
  <h2>Recipe demos</h2>
  <p>Card recipes:</p>
  <div class="row" style="margin-bottom:1rem">
    ${Object.entries(cardClasses).map(([name, cls]) =>
      `<div class="card-demo ${cls}">${name}</div>`
    ).join("")}
  </div>
  <p>Focus recipes:</p>
  <div class="row" style="margin-bottom:1rem">
    ${Object.entries(focusClasses).map(([name, cls]) =>
      `<div class="swatch ${cls}" style="border-radius:6px;background:#fff">${name}</div>`
    ).join("")}
  </div>
  <p>State recipes:</p>
  <div class="row">
    ${Object.entries(stateClasses).map(([name, cls]) =>
      `<div class="swatch ${cls}" style="border-radius:6px;background:#4dabf7;color:#fff">${name}</div>`
    ).join("")}
  </div>
`;
app.appendChild(recipeSection);

// --- Classes + CSS ---
const classSection = document.createElement("section");
classSection.innerHTML = `
  <h2>Recipe classes</h2>
  <pre><code>${escapeHtml(JSON.stringify(theme.effects.classes, null, 2))}</code></pre>
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
