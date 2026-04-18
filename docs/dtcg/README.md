# DTCG Import / Export

Import tokens from the W3C Design Tokens Community Group (DTCG) format into `createTheme`, and export theme tokens back to DTCG JSON.

**Files:** `src/dtcg/` — `types.ts`, `parse.ts`, `import.ts`, `export.ts`.

---

## The flow

```
Figma (Tokens Studio)  →  DTCG JSON  →  fromDTCG()  →  raw theme  →  createTheme()
                                                                            ↓
                         DTCG JSON  ←  toDTCG()    ←  built theme  ←  theme object
```

Both `fromDTCG` and `toDTCG` return plain objects. Modify them freely between steps.

---

## Import: `fromDTCG(doc, options?)`

Converts a DTCG token document into a `createTheme` raw input.

```ts
import { fromDTCG, createTheme } from "@theme-registry/theme-kit";

const dtcgJson = {
  color: {
    $type: "color",
    brand: {
      primary: { $value: "#0066ff" },
      accent:  { $value: "#f59e0b" },
    },
  },
  fontSize: {
    $type: "dimension",
    sm: { $value: "14px" },
    md: { $value: "16px" },
    lg: { $value: "20px" },
  },
  spacing: {
    $type: "dimension",
    sm: { $value: "4px" },
    md: { $value: "8px" },
    lg: { $value: "16px" },
  },
  breakpoint: {
    $type: "dimension",
    sm: { $value: "576px" },
    md: { $value: "768px" },
    lg: { $value: "1024px" },
  },
};

const rawTheme = fromDTCG(dtcgJson, { breakpointGroup: "breakpoint" });

// Modify before creating the theme
rawTheme.colors.brand.text = "#fff";

const theme = createTheme(rawTheme, { colors: { prefix: "app" } });
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `breakpoints` | `Record<string, number>` | — | Explicit breakpoints (overrides auto-detection) |
| `breakpointGroup` | `string` | — | DTCG group path to extract breakpoints from (e.g. `"breakpoint"`) |
| `groupMapping` | `Record<string, "colors" \| "typography" \| "effects" \| "layout" \| "ignore">` | auto-detect | Override subsystem mapping for specific groups |

### Auto-detection

Groups are mapped to subsystems by `$type` and naming convention:

| DTCG `$type` | Maps to |
|---|---|
| `color` | `colors` |
| `typography` | `typography` (decomposed into individual properties) |
| `fontFamily`, `fontWeight` | `typography` |
| `shadow` | `effects.shadow` |
| `border` | `effects.borderWidth` |
| `transition` | `effects.transitions` |
| `dimension` | detected by name: `spacing*` → `layout`, `radius*` → `effects`, `fontSize*` → `typography` |
| `number` | detected by name: `opacity*` → `effects`, `zIndex*` → `effects` |

Override auto-detection with `groupMapping`:

```ts
fromDTCG(dtcgJson, {
  groupMapping: {
    "custom-sizes": "typography",    // force to typography
    "internal-debug": "ignore",      // skip entirely
  },
});
```

### Reference resolution

DTCG references (`{path.to.token}`) are resolved before mapping:

```json
{
  "color": {
    "$type": "color",
    "brand": { "$value": "#0066ff" },
    "bg":    { "$value": "{color.brand}" }
  }
}
```

`bg` resolves to `#0066ff`. Circular references throw.

### Composite tokens

DTCG composite `typography` tokens are decomposed into individual PropertyValue entries:

```json
{
  "typography": {
    "$type": "typography",
    "heading": {
      "$value": {
        "fontFamily": "Georgia, serif",
        "fontSize": "2rem",
        "fontWeight": 700,
        "lineHeight": 1.2
      }
    }
  }
}
```

Becomes:

```ts
{
  typography: {
    fontFamily: { base: "Georgia, serif", variants: { heading: "Georgia, serif" } },
    fontSize:   { base: 32, variants: { heading: 32 } },
    fontWeight: { base: 700, variants: { heading: 700 } },
    lineHeight: { base: 1.2, variants: { heading: 1.2 } },
  }
}
```

### Post-import modifications

The result is a plain object. Add anything the DTCG format doesn't cover:

```ts
const rawTheme = fromDTCG(dtcgJson, { breakpointGroup: "breakpoint" });

// Add recipes (not in DTCG)
rawTheme.colors.recipes = {
  solid: { primary: { background: "brand", color: "brand.text" } },
};

// Add responsive overrides (not in DTCG)
rawTheme.typography.fontSize.responsive = [
  { breakpoint: "md", base: 18 },
];

// Add layout features (not in DTCG)
rawTheme.layout.container = { base: "fixed" };

const theme = createTheme(rawTheme);
```

---

## Export: `toDTCG(theme, options?)`

Converts a built theme's tokens into a DTCG-compliant JSON document.

```ts
import { toDTCG } from "@theme-registry/theme-kit";

const dtcg = toDTCG(theme, { name: "My Design System" });
// Write to file
fs.writeFileSync("tokens.json", JSON.stringify(dtcg, null, 2));
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | `$name` for the DTCG document |
| `includeBreakpoints` | `boolean` | `true` | Include breakpoints as dimension tokens |

### What gets exported

| Theme source | DTCG output |
|---|---|
| `theme.breakpoints` | `breakpoint` group, `$type: "dimension"` |
| `theme.colors.tokens` | `color` group, `$type: "color"` |
| `theme.typography.tokens` | `typography` group, individual property types |
| `theme.effects.tokens` | `shadow`, `radius`, `opacity`, etc. groups |
| `theme.layout.tokens` | `spacing`, `gutters` groups, `$type: "dimension"` |

### What doesn't get exported

- **Recipes** — DTCG has no recipe/variant concept
- **Responsive overrides** — DTCG tokens are static values
- **Class names** — framework-specific output
- **Computed values** (lighten/darken results) — only base + explicit variants

---

## Figma workflow

A typical Figma → code workflow using Tokens Studio:

1. **Designer** defines tokens in Figma using Tokens Studio plugin
2. **Tokens Studio** syncs to Git (JSON files per token set)
3. **Developer** reads the JSON and imports:

```ts
import tokensJson from "./tokens/global.json";
import { fromDTCG, createTheme } from "@theme-registry/theme-kit";

const rawTheme = fromDTCG(tokensJson, { breakpointGroup: "breakpoint" });

// Add recipes, responsive, layout features...
rawTheme.colors.recipes = { /* ... */ };

const theme = createTheme(rawTheme);
```

4. **To sync back** after adding tokens in code:

```ts
import { toDTCG } from "@theme-registry/theme-kit";
const dtcg = toDTCG(theme);
fs.writeFileSync("tokens/global.json", JSON.stringify(dtcg, null, 2));
```

### Tokens Studio format note

Tokens Studio can export in both its legacy format (`value`/`type`) and DTCG format (`$value`/`$type`). Use the DTCG export option in Tokens Studio settings. If using the legacy format, convert to DTCG first using `@tokens-studio/sd-transforms` or map manually.

---

## Limitations

- **DTCG is flat, theme-kit is structured.** DTCG tokens are single values; theme-kit has PropertyValue (base + variants + responsive). The import maps DTCG groups into variants by convention; the export flattens variants back.
- **No recipes in DTCG.** Recipes are a theme-kit concept. Add them post-import.
- **No responsive in DTCG.** Responsive overrides must be added post-import.
- **Breakpoints are convention.** DTCG has no breakpoint type — dimension tokens named `breakpoint.*` are the convention.
- **Shadow format.** DTCG shadows use structured objects; theme-kit uses CSS shorthand strings. The converter handles this both ways.
