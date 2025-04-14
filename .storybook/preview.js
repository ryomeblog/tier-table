import '../src/index.css';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  // Dark modeをデフォルトに設定
  backgrounds: {
    default: 'dark',
    values: [
      {
        name: 'dark',
        value: '#1e1e1e',
      },
    ],
  },
};

export default preview;
