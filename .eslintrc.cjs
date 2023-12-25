// @ts-check

/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    ignorePatterns: ['*.config.*', '*.cjs'],
};

module.exports = config;
