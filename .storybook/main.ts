import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)", "../src/**/*.mdx"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-themes",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  staticDirs: [{ from: "./fonts", to: "/fonts" }],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};
export default config;
