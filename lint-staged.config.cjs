// @ts-check

/**
 * @type {import('lint-staged').Config}
 */
const config = {
    '*.?(c|m){js,ts}?(x)': ['prettier --write', 'pnpm --filter antalmanac exec eslint --quiet --fix'],
};

module.exports = config;
