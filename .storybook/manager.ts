import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming';

const theme = create({
  base: 'dark',
  brandTitle: 'Volcanium Components',
  brandUrl: '/',
  brandTarget: '_self',

  // Colors
  colorPrimary: '#ff714d',
  colorSecondary: '#ff714d',

  // UI Settings
  appBg: '#121212',
  appContentBg: '#121212',
  appPreviewBg: '#121212',
  appBorderColor: '#332c29',
  appBorderRadius: 8,

  // Typography
  fontBase: '"DM Sans", system-ui, sans-serif',
  fontCode: 'monospace',

  // Text Colors
  textColor: '#ffffff',
  textInverseColor: '#121212',

  // Toolbar
  barTextColor: '#a3a3a3',
  barSelectedColor: '#ff714d',
  barHoverColor: '#ffffff',
  barBg: '#121212',

  // Forms
  inputBg: '#332c29',
  inputBorder: '#332c29',
  inputTextColor: '#ffffff',
  inputBorderRadius: 4,
});

addons.setConfig({
  theme,
});
