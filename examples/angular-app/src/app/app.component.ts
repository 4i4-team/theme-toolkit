import { Component, inject, OnInit } from '@angular/core';
import { APP_THEME } from './theme';
import { ButtonsComponent } from './components/buttons.component';
import { CardsComponent } from './components/cards.component';
import { TypographyComponent } from './components/typography.component';
import { ColorsComponent } from './components/colors.component';
import { TokensComponent } from './components/tokens.component';

type TabKey = 'buttons' | 'cards' | 'typography' | 'colors' | 'tokens';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ButtonsComponent, CardsComponent, TypographyComponent, ColorsComponent, TokensComponent],
  template: `
    <div class="page">
      <header class="header">
        <h1 class="header-title">&#64;theme-registry/theme-kit</h1>
        <p class="header-subtitle">Angular example — no adapters needed</p>
      </header>

      <nav class="nav">
        @for (tab of tabs; track tab.key) {
          <button
            class="nav-tab"
            [class.active]="activeTab === tab.key"
            (click)="activeTab = tab.key">
            {{ tab.label }}
          </button>
        }
      </nav>

      <main class="main">
        @switch (activeTab) {
          @case ('buttons') { <app-buttons /> }
          @case ('cards') { <app-cards /> }
          @case ('typography') { <app-typography /> }
          @case ('colors') { <app-colors /> }
          @case ('tokens') { <app-tokens /> }
        }
      </main>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; }
    .header {
      background: #fff; border-bottom: 1px solid #e9ecef; padding: 24px 32px;
    }
    .header-title { font-size: 1.5rem; font-weight: 700; margin: 0; }
    .header-subtitle { margin: 4px 0 0; color: #868e96; font-size: 0.9rem; }
    .nav {
      background: #fff; border-bottom: 1px solid #e9ecef;
      padding: 0 32px; display: flex; gap: 4px;
    }
    .nav-tab {
      padding: 12px 16px; border: none; background: transparent;
      cursor: pointer; font-weight: 400; color: #495057;
      border-bottom: 2px solid transparent; font-size: 0.9rem;
      transition: color 150ms ease;
    }
    .nav-tab:hover { color: #1c7ed6; }
    .nav-tab.active {
      font-weight: 600; color: #1c7ed6;
      border-bottom-color: #1c7ed6;
    }
    .main { padding: 32px; max-width: 960px; margin: 0 auto; }
  `],
})
export class AppComponent implements OnInit {
  private theme = inject(APP_THEME);

  activeTab: TabKey = 'buttons';

  tabs: { key: TabKey; label: string }[] = [
    { key: 'buttons', label: 'Buttons' },
    { key: 'cards', label: 'Cards' },
    { key: 'typography', label: 'Typography' },
    { key: 'colors', label: 'Colors' },
    { key: 'tokens', label: 'Tokens' },
  ];

  ngOnInit(): void {
    // Inject theme CSS into the document head
    const style = document.createElement('style');
    style.textContent = this.theme.css;
    document.head.appendChild(style);
  }
}
