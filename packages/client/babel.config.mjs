export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '85',
        },
        corejs: '3.38.1',
        useBuiltIns: 'usage',
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: ['@babel/plugin-transform-class-properties'],
};
