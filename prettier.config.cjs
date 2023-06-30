/**
 * `cjs` format is required for plugins to work in VSCode.
 * @see {@link https://github.com/tailwindlabs/prettier-plugin-tailwindcss/issues/113}
 */

/** @type {import('prettier').Config} */
const config = {
  printWidth: 120,
  tabWidth: 4,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
}

module.exports = config
