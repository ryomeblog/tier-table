module.exports = {
  style: {
    postcss: {
      loaderOptions: {
        postcssOptions: {
          plugins: ['tailwindcss', 'autoprefixer'],
        },
      },
    },
  },
};
