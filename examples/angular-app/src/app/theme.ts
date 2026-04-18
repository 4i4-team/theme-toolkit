import { InjectionToken } from '@angular/core';
import { createTheme } from '@4i4/theme-toolkit';

export const rawTheme = {
  breakpoints: { sm: 576, md: 768, lg: 1024, xl: 1280 },

  colors: {
    primary: { base: '#4dabf7', text: '#fff', variants: { dark: '#1c7ed6', light: '#a5d8ff' } },
    neutral: { base: '#868e96', text: '#fff', variants: { light: '#f1f3f5', dark: '#343a40' } },
    danger: { base: '#ff6b6b', text: '#fff' },
    success: { base: '#51cf66', text: '#fff' },
    recipes: {
      solid: {
        primary: { background: 'primary', color: 'primary.text' },
        danger: { background: 'danger', color: 'danger.text' },
        success: { background: 'success', color: 'success.text' },
        neutral: { background: 'neutral.light', color: 'neutral.dark' },
      },
    },
  },

  typography: {
    fontFamily: {
      base: 'system-ui, -apple-system, sans-serif',
      variants: { heading: 'Georgia, serif', mono: "'Fira Code', monospace" },
    },
    fontSize: { base: 16, variants: { xs: 12, sm: 14, lg: 20, xl: 24, '2xl': 32, '3xl': 40 } },
    fontWeight: { base: 400, variants: { medium: 500, semibold: 600, bold: 700 } },
    lineHeight: { base: 1.5, variants: { tight: 1.2, loose: 1.8 } },
    letterSpacing: { base: '0', variants: { tight: '-0.02em', wide: '0.05em' } },
    recipes: {
      heading: {
        h1: { fontFamily: 'heading', fontSize: '3xl', fontWeight: 'bold', lineHeight: 'tight', letterSpacing: 'tight' },
        h2: { fontFamily: 'heading', fontSize: '2xl', fontWeight: 'bold', lineHeight: 'tight' },
        h3: { fontFamily: 'heading', fontSize: 'xl', fontWeight: 'semibold' },
      },
      body: {
        base: { fontSize: 'base', lineHeight: 'base' },
        small: { fontSize: 'sm', lineHeight: 'base' },
        large: { fontSize: 'lg', lineHeight: 'loose' },
      },
      button: {
        large: { fontSize: 'lg', fontWeight: 'medium' },
        small: { fontSize: 'sm', fontWeight: 'medium' },
      },
    },
  },

  effects: {
    radius: { base: 6, variants: { none: 0, sm: 4, lg: 12, xl: 16, full: '9999px' } },
    shadow: {
      base: '0 1px 3px rgba(0,0,0,0.1)',
      variants: {
        none: 'none',
        md: '0 4px 6px rgba(0,0,0,0.07)',
        lg: '0 10px 20px rgba(0,0,0,0.1)',
      },
    },
    transitions: {
      base: 'all 150ms ease',
      variants: { fast: 'all 80ms ease', slow: 'all 300ms ease' },
    },
    recipes: {
      card: {
        default: { borderRadius: 'base', boxShadow: 'base', transition: 'base' },
        elevated: { borderRadius: 'lg', boxShadow: 'lg' },
      },
    },
  },

  layout: {
    spacing: { base: 8, variants: { xs: 4, sm: 6, md: 12, lg: 16, xl: 24, '2xl': 32, '3xl': 48 } },
    recipes: {
      padding: {
        card: { paddingY: 'xl', paddingX: 'xl' },
        'button-lg': { paddingY: 'md', paddingX: 'xl' },
        'button-sm': { paddingY: 'sm', paddingX: 'md' },
      },
    },
  },

  components: {
    recipes: {
      buttons: {
        primary: {
          colors: 'solid.primary',
          typography: 'button.large',
          layout: 'padding.button-lg',
          effects: 'card.default',
          css: { cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
        },
        'primary-sm': {
          colors: 'solid.primary',
          typography: 'button.small',
          layout: 'padding.button-sm',
          effects: 'card.default',
          css: { cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
        },
        danger: {
          colors: 'solid.danger',
          typography: 'button.large',
          layout: 'padding.button-lg',
          effects: 'card.default',
          css: { cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
        },
      },
      cards: {
        default: {
          effects: 'card.default',
          layout: 'padding.card',
          css: { background: '#fff', overflow: 'hidden' },
        },
        elevated: {
          effects: 'card.elevated',
          layout: 'padding.card',
          css: { background: '#fff', overflow: 'hidden' },
        },
        hero: {
          colors: 'solid.primary',
          effects: 'card.elevated',
          layout: 'padding.card',
          typography: 'heading.h2',
        },
      },
      badges: {
        default: {
          colors: 'solid.neutral',
          typography: 'body.small',
          css: { display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '9999px' },
        },
        success: {
          colors: 'solid.success',
          typography: 'body.small',
          css: { display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '9999px' },
        },
      },
    },
  },
};

export const options = {
  colors: { prefix: 'app', classPrefix: 'app-color' },
  typography: { prefix: 'app', classPrefix: 'app-type' },
  effects: { prefix: 'app', classPrefix: 'app-fx' },
  layout: { prefix: 'app', classPrefix: 'app-layout' },
  components: { prefix: 'app', classPrefix: 'app' },
};

export const theme = createTheme(rawTheme as any, options);

export type AppTheme = typeof theme;

export const APP_THEME = new InjectionToken<AppTheme>('APP_THEME', {
  providedIn: 'root',
  factory: () => theme,
});
