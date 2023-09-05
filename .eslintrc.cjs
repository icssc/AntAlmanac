// @ts-check

/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
    },
    plugins: ['import', '@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
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
            typescript: {}
        },
    },
    ignorePatterns: ['*.config.*', '*.cjs'],
};

module.exports = config;
