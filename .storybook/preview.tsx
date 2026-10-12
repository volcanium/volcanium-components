import type { Preview } from "@storybook/react";
import React, { useEffect } from "react";
import { themes } from '@storybook/theming';
import { BrowserRouter } from "react-router-dom";
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n';
import "../src/index.css";

const i18nDecorator = (Story, context) => {
  const locale = context?.globals?.locale || 'en';
  i18n.changeLanguage(locale);
  return (
    <I18nextProvider i18n={i18n}>
      <Story />
    </I18nextProvider>
  );
};

const preview: Preview = {
  parameters: {
    docs: {
      theme: themes.dark,
      description: {
        component: 'Customizable UI Component',
      },
    },
    backgrounds: {
      disable: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    a11y: {
      config: {},
      options: {
        checks: { 'color-contrast': { options: { noScroll: true } } }
      }
    }
  },
  globals: {
    locale: 'en',
  },
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', right: '🇺🇸', title: 'English' },
          { value: 'fr', right: '🇫🇷', title: 'Français' },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
    i18nDecorator,
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'dark',
      // The library reads `data-theme` (see VolcaniumProvider), not a class.
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;
