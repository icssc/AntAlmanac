/** @type {import('lint-staged').Config} */
const config = {
  '*.{css,scss,cjs,js,ts,tsx,yml,json,html}': ['prettier --write'],
  '*.{js,ts,tsx}': ['eslint --fix'],
};

module.exports = config;
