// @ts-check

/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['tsconfig.json'],
        sourceType: 'module',
    },
    plugins: ['import', '@typescript-eslint/eslint-plugin'],
    extends: [
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    rules: {
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            },
        ],
        'import/order': [
            'error',
            {
                alphabetize: {
                    order: 'asc',
                },
                'newlines-between': 'always',
            },
        ],
    },
    settings: {
        'import/resolver': {
            typescript: true,
        },
    },
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    ignorePatterns: ['*.config.*', '*rc.cjs'],
};

module.exports = config;
