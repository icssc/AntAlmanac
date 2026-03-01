// @ts-check

/**
 * @type {import('lint-staged').Config}
 */
const config = {
    "*.?(c|m){js,ts}?(x)": ["pnpm format", "pnpm lint --fix"],
};

module.exports = config;
