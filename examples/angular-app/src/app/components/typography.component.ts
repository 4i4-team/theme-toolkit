import { Component, inject } from '@angular/core';
import { APP_THEME } from '../theme';

@Component({
  selector: 'app-typography',
  standalone: true,
  template: `
    <section>
      <h2 class="section-title">Typography</h2>
      <p class="section-desc">
        Typography recipe classes applied via <code>[class]</code> binding.
        CSS variables control font family, size, weight, line height, and letter spacing.
      </p>

      <div class="showcase">
        <h1 [class]="getTypoClass('heading', 'h1')">Heading H1</h1>
        <h2 [class]="getTypoClass('heading', 'h2')">Heading H2</h2>
        <h3 [class]="getTypoClass('heading', 'h3')">Heading H3</h3>
        <p [class]="getTypoClass('body', 'large')" style="margin-top: 16px">Body large — for intros and lead paragraphs.</p>
        <p [class]="getTypoClass('body', 'base')">Body base — default reading text.</p>
        <p [class]="getTypoClass('body', 'small')" style="color: #868e96">Body small — captions and metadata.</p>
      </div>

      <h3 class="sub-title">Usage</h3>
      <pre class="code">&lt;h1 [class]="theme.typography.getClass('heading', 'h1')"&gt;
  Heading H1
&lt;/h1&gt;

&lt;p [class]="theme.typography.getClass('body', 'base')"&gt;
  Body text
&lt;/p&gt;</pre>
    </section>
  `,
  styles: [`
    .showcase {
      background: #fff;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .showcase > * + * { margin-top: 12px; }
  `],
})
export class TypographyComponent {
  private theme = inject(APP_THEME);

  getTypoClass(group: "heading" | "body" | "button", variant: string): string {
    return (this.theme.typography.getClass as any)(group, variant) ?? '';
  }
}
