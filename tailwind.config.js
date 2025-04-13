/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './.storybook/preview.js'],
  theme: {
    extend: {
      colors: {
        'tier-s': '#ff6b6b',
        'tier-a': '#ffb347',
        'tier-b': '#ffff66',
        'tier-c': '#b9ff73',
        'tier-d': '#73c2fb',
        'dark-bg': '#1e1e1e',
        'dark-surface': '#2a2a2a',
        'dark-border': '#444444',
      },
    },
  },
  plugins: [],
};
