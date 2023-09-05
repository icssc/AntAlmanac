// @ts-check

/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
    parserOptions: {
        project: ['./tsconfig.json'],
    },
    plugins: ['react', 'react-hooks', '@typescript-eslint/eslint-plugin'],
    extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:react/jsx-runtime',
        'plugin:jsx-a11y/recommended',
    ],
    env: {
        browser: true,
        es6: true,
    },
    globals: {
        React: true,
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};

module.exports = config;
