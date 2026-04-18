import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { APP_THEME } from '../theme';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <section>
      <h2 class="section-title">Buttons</h2>
      <p class="section-desc">
        Composed via the components subsystem — each button combines colors + typography + layout + effects recipes.
      </p>

      <div class="row">
        <button [class]="getClass('buttons', 'primary')">Primary</button>
        <button [class]="getClass('buttons', 'primary-sm')">Primary Small</button>
        <button [class]="getClass('buttons', 'danger')">Danger</button>
        <button class="ghost-btn">Ghost</button>
      </div>

      <h3 class="sub-title">Resolved class names</h3>
      <pre class="code">{{ buttonClasses | json }}</pre>
    </section>
  `,
  styles: [`
    .row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 24px; }
    .ghost-btn {
      cursor: pointer; border: none; background: transparent; color: inherit;
      padding: 6px 12px; font-size: 0.875rem; font-weight: 500;
    }
    .ghost-btn:hover { background: #f1f3f5; border-radius: 6px; }
  `],
})
export class ButtonsComponent {
  private theme = inject(APP_THEME);

  buttonClasses = this.theme.components.classes?.['buttons'] ?? {};

  getClass(group: "buttons" | "cards" | "badges", variant: string): string {
    return (this.theme.components.getClass as any)(group, variant) ?? '';
  }
}
