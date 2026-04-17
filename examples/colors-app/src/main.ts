import { theme } from "./theme";

// 1. Inject the generated stylesheet — one <style> tag, single :root block
const style = document.createElement("style");
style.textContent = theme.css;
document.head.appendChild(style);

// 2. Add some base page styles
const baseStyle = document.createElement("style");
baseStyle.textContent = `
  * { margin: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; padding: 2rem; background: #f5f5f5; }
  h1 { margin-bottom: 1rem; }
  h2 { margin: 2rem 0 1rem; font-size: 1.2rem; }
  section { margin-bottom: 2rem; }
  .grid { display: flex; gap: 1rem; flex-wrap: wrap; }
  .swatch {
    width: 100px; height: 100px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 600;
  }
  .btn {
    padding: 0.5rem 1.5rem; border-radius: 6px; border: 2px solid transparent;
    font-size: 1rem; cursor: pointer; font-weight: 500;
  }
  pre { background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px;
    overflow-x: auto; font-size: 0.85rem; line-height: 1.6; }
  code { font-family: "SF Mono", "Fira Code", monospace; }
`;
document.head.appendChild(baseStyle);

const app = document.getElementById("app")!;

// 3. Header
app.innerHTML = `<h1>Colors Example <small style="font-weight:400;font-size:0.8rem;color:#666">vanilla, no framework</small></h1>`;

// 4. Show raw theme input passthrough
const rawSection = document.createElement("section");
rawSection.innerHTML = `
  <h2>Raw input passthrough (theme.colors.primary)</h2>
  <pre><code>${JSON.stringify(theme.colors.primary, null, 2)}</code></pre>
`;
app.appendChild(rawSection);

// 5. Show tokens
const tokensSection = document.createElement("section");
const tokenNames = Object.keys(theme.colors.tokens);
tokensSection.innerHTML = `
  <h2>Tokens (theme.colors.tokens)</h2>
  <div class="grid">
    ${tokenNames
      .map(name => {
        const token = (theme.colors.tokens as Record<string, { text: string; variants: Record<string, string> }>)[name];
        return Object.entries(token.variants)
          .map(
            ([variant, hex]) => `
              <div class="swatch" style="background:${hex};color:${token.text}">
                ${name}.${variant}
              </div>`,
          )
          .join("");
      })
      .join("")}
  </div>
`;
app.appendChild(tokensSection);

// 6. Show recipe class names + live buttons
const recipesSection = document.createElement("section");
const buttonClasses = theme.colors.classes?.buttons ?? {};
recipesSection.innerHTML = `
  <h2>Recipes (className-based, no framework)</h2>
  <div class="grid" style="align-items:center">
    ${Object.entries(buttonClasses)
      .map(
        ([variant, className]) =>
          `<button class="btn ${className}">${variant}</button>`,
      )
      .join("")}
  </div>
  <h2>Recipe classes map</h2>
  <pre><code>${JSON.stringify(theme.colors.classes, null, 2)}</code></pre>
`;
app.appendChild(recipesSection);

// 7. Show responsive info
const responsiveSection = document.createElement("section");
responsiveSection.innerHTML = `
  <h2>Responsive (resize the window to test)</h2>
  <p>The <code>primary</code> base color swaps to <code>#1940b0</code> at
  <code>sm</code> and below via a CSS variable override. The outline button's
  border/color swaps to <code>accent</code> at <code>md</code> and above.
  No JavaScript involved — pure CSS cascade via <code>var(--...)</code>.</p>
`;
app.appendChild(responsiveSection);

// 8. Show the full generated CSS
const cssSection = document.createElement("section");
cssSection.innerHTML = `
  <h2>Generated CSS (theme.css)</h2>
  <pre><code>${escapeHtml(theme.css)}</code></pre>
`;
app.appendChild(cssSection);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
