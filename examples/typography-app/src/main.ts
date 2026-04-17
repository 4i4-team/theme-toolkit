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
  .scale-row { display: flex; gap: 0; border-radius: 8px; overflow: hidden; }
  .scale-swatch {
    flex: 1 1 0; height: 50px; background: #1d1d1f; color: #fff;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-size: 0.65rem; font-weight: 600; gap: 2px; overflow: hidden;
  }
  .scale-swatch span { opacity: 0.7; font-weight: 400; font-size: 0.6rem; }
  .preview-card {
    background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
    padding: 1.5rem; margin-bottom: 1rem;
  }
  .preview-label { font-size: 0.7rem; color: #999; margin-bottom: 0.25rem; font-family: monospace; }
  .grid { display: flex; gap: 1rem; flex-wrap: wrap; }
  .btn {
    padding: 0.5rem 1.5rem; border-radius: 6px; border: 1px solid #ccc;
    background: #fff; cursor: pointer;
  }
  pre {
    background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px;
    overflow-x: auto; font-size: 0.8rem; line-height: 1.5;
  }
`;
document.head.appendChild(baseStyle);

const app = document.getElementById("app")!;
app.innerHTML = `<h1>Typography Example <small>vanilla TS, no framework</small></h1>`;

// --- Raw input ---
const rawSection = document.createElement("section");
const typographyEntries = Object.entries(rawTheme.typography)
  .filter(([key]) => key !== "styles")
  .map(([key, value]) => `  ${key}: ${formatValue(value)},`);

const styleGroups = Object.entries(rawTheme.typography.styles);
const styleLines = styleGroups.map(([group, variants]) => {
  const variantNames = Object.keys(variants as Record<string, unknown>);
  return `    ${group}: { ${variantNames.map(v => `${v}: {...}`).join(", ")} },`;
});

rawSection.innerHTML = `
  <h2>Raw input (rawTheme.typography)</h2>
  <pre><code>typography: {
${typographyEntries.join("\n")}
  styles: {
${styleLines.join("\n")}
  },
}</code></pre>
`;
app.appendChild(rawSection);

// --- Scale ---
const scaleSection = document.createElement("section");
const tokens = theme.typography.tokens;
const scaleEntries = tokens ? Object.entries(tokens.scale) : [];
scaleSection.innerHTML = `
  <h2>Type scale (${rawTheme.typography.scale.ratio}, base ${rawTheme.typography.scale.baseFontSize}px → rem)</h2>
  <div class="scale-row">
    ${scaleEntries.map(([key, val]) =>
      `<div class="scale-swatch" style="font-size:${val.value}${val.unit}">
        ${key}<span>${val.value}${val.unit}</span>
      </div>`
    ).join("")}
  </div>
`;
app.appendChild(scaleSection);

// --- Style previews ---
const previewSection = document.createElement("section");
previewSection.innerHTML = `<h2>Style previews (className-based)</h2>`;

const allClasses = theme.typography.classes ?? {};
for (const [group, variants] of Object.entries(allClasses)) {
  for (const [variant, className] of Object.entries(variants)) {
    const card = document.createElement("div");
    card.className = "preview-card";
    card.innerHTML = `
      <div class="preview-label">${group}.${variant} → .${className}</div>
      <div class="${className}">The quick brown fox jumps over the lazy dog</div>
    `;
    previewSection.appendChild(card);
  }
}
app.appendChild(previewSection);

// --- Responsive ---
const responsiveSection = document.createElement("section");
responsiveSection.innerHTML = `
  <h2>Responsive</h2>
  <p>Resize the window: <code>heading.xl</code> scales from <code>xl</code> to <code>2xl</code>
  with bolder weight at <code>lg</code> and above. <code>heading.2xl</code> scales to <code>3xl</code>.
  All via <code>var(--...)</code> + <code>@media</code> — no JavaScript.</p>
`;
app.appendChild(responsiveSection);

// --- Class map ---
const classSection = document.createElement("section");
classSection.innerHTML = `
  <h2>Class map</h2>
  <pre><code>${escapeHtml(JSON.stringify(allClasses, null, 2))}</code></pre>
`;
app.appendChild(classSection);

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
