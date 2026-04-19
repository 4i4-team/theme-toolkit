# Examples

Runnable apps demonstrating each subsystem and integration pattern.

| Example | Stack | Description |
|---|---|---|
| [`colors-app`](colors-app/) | vanilla TS | Palette swatches, step generation, recipe buttons |
| [`typography-app`](typography-app/) | vanilla TS | Type scale, font variants, recipe text samples |
| [`layout-app`](layout-app/) | vanilla TS | Spacing, containers, columns, grids, stacks |
| [`effects-app`](effects-app/) | vanilla TS | Radius, shadow, opacity, border width, outline |
| [`components-app`](components-app/) | vanilla TS | Cross-subsystem recipe composition |
| [`react-app`](react-app/) | React | Bare React, className-based, no styled-components |
| [`react-sc-app`](react-sc-app/) | React + SC | Media templates, typographyMixin, direct tokens, CSS vars |
| [`angular-app`](angular-app/) | Angular 19 | InjectionToken, class bindings, CSS variables, direct tokens |
| [`delivery-global-app`](delivery-global-app/) | vanilla TS | Single global CSS — simplest setup |
| [`delivery-split-app`](delivery-split-app/) | vanilla TS | Variables global, recipes lazy-loaded per route |
| [`delivery-component-app`](delivery-component-app/) | vanilla TS | Per-component CSS mount/unmount (PrimeNG style) |
| [`delivery-scoped-app`](delivery-scoped-app/) | vanilla TS | Two MFEs with scoped variables on one page |
| [`delivery-inline-app`](delivery-inline-app/) | vanilla TS | Inline values, no CSS variables (email/static) |

## Run any example

```bash
cd examples/<name>
npm install
npm run dev    # Vite apps
ng serve       # Angular app
```

Each app depends on the local workspace version of the toolkit via a `file:../..` reference.

## Legacy examples

These examples use the previous API where `createTheme` auto-imported styled-components. Use `react-sc-app` instead — it shows the new adapter-based integration with `createStyledComponentsAdapter()`.

| Example | Notes |
|---|---|
| [`media-app`](media-app/) | Old media helpers demo — predates the current architecture |
| [`theme-app`](theme-app/) | Old `createTheme` demo with SC — uses the legacy API |
