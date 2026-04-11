# Examples

Each subsystem ships a runnable Vite + React sample you can bootstrap locally:

| Example | Description |
|---------|-------------|
| [`media-app`](media-app) | Demonstrates `@4i4/theme-toolkit/media` helpers (`mediaQuery`, `DEFAULT_BREAKPOINTS`). |
| [`colors-app`](colors-app) | Builds palette tokens and injects the generated CSS variables. |
| [`layout-app`](layout-app) | Uses `buildGridTokens` directly, applying container/column/style mixins without a ThemeProvider. |
| [`typography-app`](typography-app) | Generates typography tokens + mixins and renders semantic text styles. |
| [`theme-app`](theme-app) | Full `createTheme` example combining palette, typography, layout, and media helpers inside styled-components. |

To run any sample:

```bash
cd examples/<example>-app
npm install
npm run dev
```

Each app depends on the local workspace version of `@4i4/theme-toolkit` via a `file:` reference.
