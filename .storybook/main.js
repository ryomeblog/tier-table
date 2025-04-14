/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  staticDirs: ['../public'],
  webpackFinal: async config => {
    if (config.module && config.module.rules) {
      // PostCSS loaderの設定を確認・追加
      const ruleCssLast = config.module.rules.findLast(rule => rule.test && rule.test.test('.css'));
      if (ruleCssLast && ruleCssLast.use) {
        const postCssLoaderIndex = ruleCssLast.use.findIndex(
          use => use.loader && use.loader.includes('postcss-loader')
        );
        if (postCssLoaderIndex === -1) {
          ruleCssLast.use.splice(
            postCssLoaderIndex === -1 ? ruleCssLast.use.length - 1 : postCssLoaderIndex,
            0,
            {
              loader: 'postcss-loader',
              options: {
                implementation: require('postcss'),
              },
            }
          );
        }
      }
    }
    return config;
  },
};

export default config;
