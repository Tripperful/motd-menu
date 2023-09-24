module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '85',
        },
        corejs: '3.32.2',
        useBuiltIns: 'usage',
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: ['@babel/plugin-transform-class-properties'],
};
