import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { APP_THEME } from '../theme';

@Component({
  selector: 'app-tokens',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <section>
      <h2 class="section-title">Tokens & Generated CSS</h2>
      <p class="section-desc">
        Raw computed values from each subsystem and the full generated CSS.
      </p>

      @for (section of sections; track section.key) {
        <div class="accordion">
          <button class="accordion-btn" (click)="toggle(section.key)">
            {{ expanded === section.key ? '\u25BE' : '\u25B8' }} {{ section.label }}
          </button>
          @if (expanded === section.key) {
            <pre class="code" style="margin-top: 4px; border-top-left-radius: 0; border-top-right-radius: 0">{{ section.data | json }}</pre>
          }
        </div>
      }

      <h3 class="sub-title" style="margin-top: 24px">Generated CSS</h3>
      <pre class="code" style="max-height: 400px; overflow: auto">{{ css }}</pre>
    </section>
  `,
  styles: [`
    .accordion { margin-bottom: 8px; }
    .accordion-btn {
      width: 100%; text-align: left; padding: 12px 16px;
      background: #fff; border: 1px solid #dee2e6; border-radius: 6px;
      cursor: pointer; font-weight: 600; font-size: 0.9rem; color: #343a40;
    }
    .accordion-btn:hover { background: #f8f9fa; }
  `],
})
export class TokensComponent {
  private theme = inject(APP_THEME);

  expanded: string | null = null;

  sections = [
    { key: 'colors', label: 'Color tokens', data: this.theme.colors.tokens },
    { key: 'typography', label: 'Typography tokens', data: this.theme.typography.tokens },
    { key: 'effects', label: 'Effects tokens', data: this.theme.effects.tokens },
    { key: 'layout', label: 'Layout tokens', data: this.theme.layout.tokens },
    { key: 'components', label: 'Components classes', data: this.theme.components.classes },
  ];

  css = this.theme.css;

  toggle(key: string): void {
    this.expanded = this.expanded === key ? null : key;
  }
}
