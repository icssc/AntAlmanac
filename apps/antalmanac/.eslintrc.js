/* eslint-disable */
// TypeScript + React projects
// setup: npm install --save-dev eslint eslint-plugin-simple-import-sort eslint-plugin-import @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-import-resolver-typescript
module.exports = {
    root: true,
    plugins: ['import', 'simple-import-sort', '@typescript-eslint'],
    parserOptions: {
        project: './tsconfig.json',
    },
    extends: ['custom', 'plugin:react/recommended', 'plugin:react-hooks/recommended', 'plugin:jsx-a11y/recommended'],
    ignorePatterns: [
        'build/',
        'tools/',
        '.eslintrc.js',
        'prettier.config.js',
        'vite.config.ts',
        'registerServiceWorker.js',
    ],
    rules: {
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        '@typescript-eslint/no-misused-promises': [
            'error',
            {
                checksVoidReturn: false,
            },
        ],
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
    },
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts'],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
                project: 'tsconfig.json',
            },
        },
        react: {
            version: 'detect',
        },
    },
};
