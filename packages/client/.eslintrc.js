module.exports = {
  extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
  env: {
    browser: true,
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    'react/prop-types': 0,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
