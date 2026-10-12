// @ts-check

/**
 * @type {import('lint-staged').Config}
 */
const config = {
    '*.?(c|m){js,ts}?(x)': ['pnpm format --no-error-on-unmatched-pattern', 'pnpm lint --fix'],
};

module.exports = config;
