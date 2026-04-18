# Angular Example

Angular 19 standalone components — no adapters, no SC, just DI + class bindings + CSS variables.

## What to look for

- **`src/app/theme.ts`** — `createTheme()` call + `InjectionToken` (`APP_THEME`). This is the Angular-idiomatic way to provide the theme — no adapter needed. The token is `providedIn: 'root'` so it's available everywhere.
- **`src/app/app.component.ts`** — injects `APP_THEME` and appends `theme.css` to the document head in `ngOnInit`. Tabbed layout with standalone component imports.
- **`src/app/components/buttons.component.ts`** — uses `[class]="getClass('buttons', 'primary')"` to apply composed component classes. Shows `theme.components.getClass()` via DI.
- **`src/app/components/cards.component.ts`** — card and badge components using `[class]` binding. Component styles reference CSS variables directly (`var(--app-effects-radius--lg)`).
- **`src/app/components/typography.component.ts`** — typography recipe classes via `[class]="getTypoClass('heading', 'h1')"`.
- **`src/app/components/colors.component.ts`** — direct token access: `theme.colors.tokens['primary'].base` used to render color swatches with `[style.background]` binding.
- **`src/app/components/tokens.component.ts`** — expandable accordion showing raw tokens and generated CSS.
- **`src/styles.scss`** — global styles only (reset, shared section classes). No theme CSS here — it's injected at runtime.

## Key patterns

1. **`InjectionToken`** — theme provided via Angular DI, injectable in any component/service.
2. **`[class]` binding** — recipe class names applied directly to elements.
3. **`[style.*]` binding** — direct token values used for dynamic inline styles.
4. **CSS variables in component styles** — `var(--app-*)` in `styles: [...]` blocks.
5. **No adapter needed** — uses the default `createTheme()` with no `adapter` option. The toolkit's output (CSS strings + class names + token objects) works natively with Angular.

## Run

```bash
npm install
ng serve
```
