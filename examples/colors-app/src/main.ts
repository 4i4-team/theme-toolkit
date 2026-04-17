import { theme } from "./theme";

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
  .grid { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .swatch {
    min-width: 70px; height: 60px; border-radius: 6px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-size: 0.65rem; font-weight: 600; gap: 2px;
  }
  .swatch span { opacity: 0.8; font-weight: 400; }
  .step-row { display: flex; gap: 0; }
  .step-swatch {
    flex: 1; min-width: 60px; height: 70px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; gap: 2px;
  }
  .step-swatch span { opacity: 0.8; font-weight: 400; font-size: 0.6rem; }
  .step-swatch.base { outline: 3px solid #1d1d1f; outline-offset: -3px; }
  .btn {
    padding: 0.5rem 1.5rem; border-radius: 6px; border: 2px solid transparent;
    font-size: 0.95rem; cursor: pointer; font-weight: 500;
  }
  pre {
    background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px;
    overflow-x: auto; font-size: 0.8rem; line-height: 1.5;
  }
`;
document.head.appendChild(baseStyle);

const app = document.getElementById("app")!;

app.innerHTML = `<h1>Colors Example <small>vanilla TS, no framework</small></h1>`;

// --- Steps section ---
const stepsSection = document.createElement("section");
const tokens = theme.colors.tokens as Record<string, { text: string; variants: Record<string, string> }>;

const colorsWithSteps = ["accent"];
const colorsWithDefaults = ["primary", "neutral", "surface"];

stepsSection.innerHTML = `
  <h2>Step progression</h2>
  <p>Each step compounds from the previous one. Steps below the base lighten progressively;
  steps above darken progressively. User-defined variants anchor the progression.</p>
`;

for (const name of colorsWithSteps) {
  const token = tokens[name];
  if (!token) continue;
  const entries = Object.entries(token.variants).filter(([k]) => !isNaN(Number(k)));
  entries.sort((a, b) => Number(a[0]) - Number(b[0]));

  const baseStep = (theme.colors as any)[name]?.baseStep?.toString() ?? "500";

  stepsSection.innerHTML += `
    <h2 style="font-size:1rem">${name} — numeric steps (base = ${baseStep})</h2>
    <div class="step-row" style="border-radius:8px;overflow:hidden">
      ${entries
        .map(
          ([step, hex]) =>
            `<div class="step-swatch ${step === baseStep ? "base" : ""}"
                  style="background:${hex};color:${token.text}">
              ${step}
              <span>${hex}</span>
            </div>`,
        )
        .join("")}
    </div>
  `;
}

for (const name of colorsWithDefaults) {
  const token = tokens[name];
  if (!token) continue;
  const order = ["lighter", "light", "main", "dark", "darker"];
  const entries = order
    .filter(k => token.variants[k])
    .map(k => [k, token.variants[k]] as [string, string]);

  stepsSection.innerHTML += `
    <h2 style="font-size:1rem">${name} — default steps (progressive)</h2>
    <div class="step-row" style="border-radius:8px;overflow:hidden">
      ${entries
        .map(
          ([step, hex]) =>
            `<div class="step-swatch ${step === "main" ? "base" : ""}"
                  style="background:${hex};color:${token.text}">
              ${step}
              <span>${hex}</span>
            </div>`,
        )
        .join("")}
    </div>
  `;
}

app.appendChild(stepsSection);

// --- Raw input passthrough ---
const rawSection = document.createElement("section");
rawSection.innerHTML = `
  <h2>Raw input passthrough</h2>
  <pre>${escapeHtml(JSON.stringify({
    "theme.colors.primary": (theme.colors as any).primary,
    "theme.colors.accent": (theme.colors as any).accent,
    "theme.colors.neutral": (theme.colors as any).neutral,
    "theme.colors.surface": (theme.colors as any).surface,
  }, null, 2))}</pre>
`;
app.appendChild(rawSection);

// --- Recipe buttons ---
const recipesSection = document.createElement("section");
const buttonClasses = theme.colors.classes?.buttons ?? {};
recipesSection.innerHTML = `
  <h2>Recipes (className-based)</h2>
  <div class="grid" style="align-items:center">
    ${Object.entries(buttonClasses)
      .map(
        ([variant, className]) =>
          `<button class="btn ${className}">${variant}</button>`,
      )
      .join("")}
  </div>
  <h2>Class map</h2>
  <pre>${escapeHtml(JSON.stringify(theme.colors.classes, null, 2))}</pre>
`;
app.appendChild(recipesSection);

// --- Responsive ---
const responsiveSection = document.createElement("section");
responsiveSection.innerHTML = `
  <h2>Responsive</h2>
  <p>Resize the window to see CSS-variable-driven responsive behavior:</p>
  <ul style="margin:0.5rem 0 1rem 1.5rem;font-size:0.9rem;color:#555;line-height:1.8">
    <li><code>primary</code> base swaps to <code>#1940b0</code> at <code>sm</code> and below</li>
    <li><code>accent</code> base swaps to step <code>700</code> at <code>lg</code> and above (step-generated variant referenced in responsive)</li>
    <li>Outline button border/color swaps to <code>accent</code> at <code>md</code> and above (recipe-level responsive)</li>
  </ul>
  <p>All via pure CSS cascade — no JavaScript involved.</p>
`;
app.appendChild(responsiveSection);

// --- Generated CSS ---
const cssSection = document.createElement("section");
cssSection.innerHTML = `
  <h2>Generated CSS</h2>
  <pre>${escapeHtml(theme.css)}</pre>
`;
app.appendChild(cssSection);

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
