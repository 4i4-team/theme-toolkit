# @4i4/theme-toolkit

A collection of layout and color utilities for styled-components themes, designed to complement [`@4i4/theme-registry`](https://github.com/4i4-team/theme-registry).

## Installation

```
npm install @4i4/theme-toolkit
# or
yarn add @4i4/theme-toolkit
```

## Usage

```ts
import { media, buildPalettes } from "@4i4/theme-toolkit";

const breakpoints = { sm: 576, md: 768, lg: 992 };
const mediaQueries = media(breakpoints);

const palette = buildPalettes({
  primary: { main: "#2251ff", text: "#ffffff" },
});
```

Refer to `src/index.ts` for the full list of helpers.
