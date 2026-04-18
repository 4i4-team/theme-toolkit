# Examples

Runnable Vite apps demonstrating each subsystem and integration pattern.

| Example | Stack | Description |
|---|---|---|
| [`colors-app`](colors-app/) | vanilla TS | Palette swatches, step generation, recipe buttons |
| [`typography-app`](typography-app/) | vanilla TS | Type scale, font variants, recipe text samples |
| [`layout-app`](layout-app/) | vanilla TS | Spacing, containers, columns, grids, stacks |
| [`effects-app`](effects-app/) | vanilla TS | Radius, shadow, opacity, border width, outline |
| [`components-app`](components-app/) | vanilla TS | Cross-subsystem recipe composition |
| [`react-app`](react-app/) | React | Bare React, className-based, no styled-components |
| [`react-sc-app`](react-sc-app/) | React + SC | Media templates, typographyMixin, direct tokens, CSS vars |

## Run any example

```bash
cd examples/<name>
npm install
npm run dev
```

Each app depends on the local workspace version of the toolkit via a `file:../..` reference.

## Legacy examples

| Example | Notes |
|---|---|
| [`media-app`](media-app/) | Old media helpers demo — predates the current architecture |
| [`theme-app`](theme-app/) | Old `createTheme` demo with SC — uses the legacy API |
