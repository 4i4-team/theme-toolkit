import { Component, inject } from '@angular/core';
import { APP_THEME } from '../theme';

@Component({
  selector: 'app-colors',
  standalone: true,
  template: `
    <section>
      <h2 class="section-title">Colors</h2>
      <p class="section-desc">
        Color palette tokens rendered as swatches. Each color generates CSS custom properties.
      </p>

      @for (entry of colorEntries; track entry.name) {
        <h3 class="sub-title" style="text-transform: capitalize">{{ entry.name }}</h3>
        <div class="swatch-grid">
          <div class="swatch" [style.background]="entry.base" style="color: #fff">
            base
            <span class="swatch-label">{{ entry.base }}</span>
          </div>
          @for (v of entry.variants; track v.name) {
            <div class="swatch"
              [style.background]="v.value"
              [style.color]="v.name === 'light' ? '#343a40' : '#fff'">
              {{ v.name }}
              <span class="swatch-label">{{ v.value }}</span>
            </div>
          }
        </div>
      }

      <h3 class="sub-title">Direct token access</h3>
      <pre class="code">// In your component:
private theme = inject(APP_THEME);

primaryBase = this.theme.colors.tokens['primary'].base;
// "#4dabf7"

primaryDark = this.theme.colors.tokens['primary'].variants.dark;
// "#1c7ed6"</pre>
    </section>
  `,
  styles: [`
    .swatch-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .swatch {
      height: 72px; border-radius: 8px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 600; gap: 2px;
    }
    .swatch-label {
      opacity: 0.8; font-weight: 400; font-size: 0.65rem;
      max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
  `],
})
export class ColorsComponent {
  private theme = inject(APP_THEME);

  colorEntries = Object.entries(this.theme.colors.tokens as Record<string, any>).map(
    ([name, token]) => ({
      name,
      base: token.base as string,
      variants: Object.entries(token.variants ?? {}).map(([n, v]) => ({
        name: n,
        value: v as string,
      })),
    }),
  );
}
