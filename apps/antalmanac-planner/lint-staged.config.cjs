/** @type {import('lint-staged').Config} */
const config = {
    '*.{css,scss,cjs,js,ts,tsx,yml,json,html}': ['oxfmt --write'],
    '*.{js,ts,tsx}': ['oxlint --fix'],
};

module.exports = config;
