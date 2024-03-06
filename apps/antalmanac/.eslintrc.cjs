// @ts-check

/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
    parserOptions: {
        project: ['tsconfig.json'],
    },
    plugins: ['react', 'react-hooks', 'jsx-a11y'],
    extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:react/jsx-runtime',
        'plugin:jsx-a11y/recommended',
    ],
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
