import { theme } from "./theme";

// --- Delivery: no global CSS — each component injects its own styles on mount ---

document.head.appendChild(Object.assign(document.createElement("style"), {
  textContent: `
    * { margin: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #f8f9fa; color: #1d1d1f; }
    h1 { margin-bottom: 0.5rem; }
    h1 small { font-weight: 400; font-size: 0.8rem; color: #666; }
    h2 { margin: 1.5rem 0 0.75rem; font-size: 1.1rem; }
    p { margin-bottom: 1rem; color: #555; font-size: 0.9rem; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; align-items: start; margin-bottom: 16px; }
    pre { background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px; overflow: auto; font-size: 0.75rem; line-height: 1.5; margin-bottom: 16px; }
    .info { background: #e7f5ff; border: 1px solid #74c0fc; border-radius: 6px; padding: 12px 16px; font-size: 0.85rem; color: #1864ab; margin-bottom: 16px; }
    .mount-area { border: 2px dashed #dee2e6; border-radius: 8px; padding: 24px; margin-bottom: 16px; min-height: 80px; }
    .mount-btn { padding: 8px 16px; border: 1px solid #dee2e6; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.85rem; margin-right: 8px; margin-bottom: 8px; }
    .mount-btn:hover { background: #e9ecef; }
    .mount-btn.mounted { background: #d3f9d8; border-color: #69db7c; }
    .style-tag { display: block; font-size: 0.7rem; color: #868e96; font-family: monospace; margin-top: 4px; }
  `,
}));

// --- Component registry: tracks what's mounted and its injected style ---
const mounted = new Map<string, { styleEl: HTMLStyleElement; css: string }>();

function mountComponent(group: string, variant: string): string {
  const key = `${group}.${variant}`;
  if (mounted.has(key)) return mounted.get(key)!.css;

  // Each component injects its own CSS (variables + rules)
  const css = theme.components.renderRecipe(group, variant);
  const styleEl = document.createElement("style");
  styleEl.dataset.component = key;
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  mounted.set(key, { styleEl, css });
  return css;
}

function unmountComponent(group: string, variant: string) {
  const key = `${group}.${variant}`;
  const entry = mounted.get(key);
  if (entry) {
    entry.styleEl.remove();
    mounted.delete(key);
  }
}

// --- UI ---
const app = document.getElementById("app")!;
app.innerHTML = `
  <h1>Delivery: Per-Component <small>PrimeNG style</small></h1>
  <p>No global CSS injected. Each component carries its own variables + recipe rules. Click to mount/unmount — watch the &lt;style&gt; tags appear and disappear in the &lt;head&gt;.</p>

  <h2>Mount components</h2>
  <div id="mount-controls"></div>

  <h2>Mounted components</h2>
  <div id="mount-area" class="mount-area">
    <p style="color: #adb5bd; font-style: italic;">No components mounted yet. Click a button above.</p>
  </div>

  <h2>Injected &lt;style&gt; tags</h2>
  <div id="style-tags"></div>

  <h2>How it works</h2>
  <pre><code>// No global theme.css injection!

// On component mount:
function mountComponent(group, variant) {
  const css = theme.components.renderRecipe(group, variant);
  // ↑ Includes only: the recipe rules + variables they reference.
  //   No extra CSS, no global :root dump.

  const style = document.createElement("style");
  style.dataset.component = \`\${group}.\${variant}\`;
  style.textContent = css;
  document.head.appendChild(style);
}

// On component unmount:
function unmountComponent(group, variant) {
  document.querySelector(\`style[data-component="\${group}.\${variant}"]\`)?.remove();
}</code></pre>
`;

const controls = document.getElementById("mount-controls")!;
const mountArea = document.getElementById("mount-area")!;
const styleTags = document.getElementById("style-tags")!;

const components = [
  { group: "buttons", variant: "primary", label: "Primary Button" },
  { group: "buttons", variant: "danger", label: "Danger Button" },
  { group: "cards", variant: "default", label: "Default Card" },
  { group: "cards", variant: "elevated", label: "Elevated Card" },
];

components.forEach(({ group, variant, label }) => {
  const btn = document.createElement("button");
  btn.className = "mount-btn";
  btn.textContent = `Mount ${label}`;
  btn.addEventListener("click", () => {
    const key = `${group}.${variant}`;
    if (mounted.has(key)) {
      unmountComponent(group, variant);
      btn.classList.remove("mounted");
      btn.textContent = `Mount ${label}`;
    } else {
      mountComponent(group, variant);
      btn.classList.add("mounted");
      btn.textContent = `Unmount ${label}`;
    }
    renderMountedState();
  });
  controls.appendChild(btn);
});

function renderMountedState() {
  if (mounted.size === 0) {
    mountArea.innerHTML = `<p style="color: #adb5bd; font-style: italic;">No components mounted yet.</p>`;
    styleTags.innerHTML = `<p style="color: #adb5bd; font-style: italic;">No style tags injected.</p>`;
    return;
  }

  // Render mounted components
  const html: string[] = [];
  for (const [key] of mounted) {
    const [group, variant] = key.split(".");
    const className = theme.components.getClass(group, variant) ?? "";
    if (group === "buttons") {
      html.push(`<button class="${className}">${variant}</button>`);
    } else {
      html.push(`<div class="${className}" style="min-width:150px"><strong>${variant} card</strong></div>`);
    }
  }
  mountArea.innerHTML = `<div class="row">${html.join("")}</div>`;

  // Show injected style tags
  const tagHtml: string[] = [];
  for (const [key, { css }] of mounted) {
    tagHtml.push(`
      <details style="margin-bottom:8px">
        <summary style="cursor:pointer;font-size:0.85rem;font-weight:600">
          &lt;style data-component="${key}"&gt; (${css.length} chars)
        </summary>
        <pre><code>${escapeHtml(css)}</code></pre>
      </details>
    `);
  }
  styleTags.innerHTML = tagHtml.join("");
}

function escapeHtml(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
