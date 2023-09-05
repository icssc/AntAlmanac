// @ts-check

/**
 * @type {import('lint-staged').Config}
 */
const config = {
    '*.{ts,js,tsx,jsx}': ['prettier --write', 'eslint --fix'],
};

module.exports = config;
