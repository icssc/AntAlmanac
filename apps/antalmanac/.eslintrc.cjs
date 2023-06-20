/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
  },
  plugins: [
    'react',
    'react-hooks',
    'import',
    'jsx-a11y',
    '@typescript-eslint/eslint-plugin',
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'import/order': 'error',
  },
  env: {
    browser: true,
    es6: true,
  },
  globals: {
    React: true,
  },
  settings: {
    react: {
      version: 'detect',
    }
  },
  ignorePatterns: ['vite.config.ts'],
}

module.exports = config
